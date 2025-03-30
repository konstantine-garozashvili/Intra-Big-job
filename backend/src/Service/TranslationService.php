<?php

namespace App\Service;

use Symfony\Contracts\HttpClient\HttpClientInterface;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;
use Symfony\Component\Cache\Adapter\FilesystemAdapter;
use Symfony\Contracts\Cache\ItemInterface;

class TranslationService
{
    private HttpClientInterface $httpClient;
    private string $apiKey;
    private string $translateEndpoint = 'https://translation.googleapis.com/language/translate/v2';
    private FilesystemAdapter $cache;

    public function __construct(
        HttpClientInterface $httpClient,
        ParameterBagInterface $params
    ) {
        $this->httpClient = $httpClient;
        $this->apiKey = $params->get('google_translate_api_key');
        // Cache pour stocker les traductions (30 jours)
        $this->cache = new FilesystemAdapter('translations', 2592000);
    }

    /**
     * Traduit un texte dans la langue cible
     *
     * @param string $text Le texte à traduire
     * @param string $targetLang La langue cible (code ISO, ex: 'fr', 'en', 'es')
     * @param string|null $sourceLang La langue source (optionnel, détection auto si null)
     * @return string Le texte traduit
     * @throws \Exception
     */
    public function translateText(string $text, string $targetLang, ?string $sourceLang = null): string
    {
        // Vérification d'entrée
        if (empty($text) || trim($text) === '') {
            return '';
        }

        // Si la langue source et la langue cible sont identiques, retourner le texte original
        if ($sourceLang && $sourceLang === $targetLang) {
            return $text;
        }

        // Clé de cache unique pour cette traduction
        $cacheKey = md5($text . '_' . $targetLang . '_' . ($sourceLang ?? 'auto'));

        // Récupérer depuis le cache ou traduire si pas en cache
        return $this->cache->get($cacheKey, function (ItemInterface $item) use ($text, $targetLang, $sourceLang) {
            return $this->callTranslateApi($text, $targetLang, $sourceLang);
        });
    }

    /**
     * Traduit un tableau de textes dans la langue cible
     *
     * @param array $texts Tableau de textes à traduire
     * @param string $targetLang La langue cible
     * @param string|null $sourceLang La langue source (optionnel)
     * @return array Tableau des textes traduits
     * @throws \Exception
     */
    public function translateBatch(array $texts, string $targetLang, ?string $sourceLang = null): array
    {
        // Filtrer les textes vides
        $texts = array_filter($texts, fn($text) => !empty($text) && trim($text) !== '');
        
        if (empty($texts)) {
            return [];
        }

        // Si langue source et cible identiques, retourner les textes originaux
        if ($sourceLang && $sourceLang === $targetLang) {
            return $texts;
        }

        // Optimisation : vérifier quels textes sont déjà en cache
        $result = [];
        $textsToTranslate = [];
        $textIndices = [];
        
        foreach ($texts as $index => $text) {
            $cacheKey = md5($text . '_' . $targetLang . '_' . ($sourceLang ?? 'auto'));
            $cachedItem = $this->cache->getItem($cacheKey);
            
            if ($cachedItem->isHit()) {
                $result[$index] = $cachedItem->get();
            } else {
                $textsToTranslate[] = $text;
                $textIndices[] = $index;
            }
        }
        
        // Si tous les textes sont en cache, retourner les résultats
        if (empty($textsToTranslate)) {
            ksort($result); // Remettre dans l'ordre original
            return $result;
        }
        
        // Traduire les textes restants en batch
        try {
            $payload = [
                'q' => $textsToTranslate,
                'target' => $targetLang,
                'format' => 'text'
            ];

            if ($sourceLang) {
                $payload['source'] = $sourceLang;
            }

            $response = $this->httpClient->request('POST', $this->translateEndpoint, [
                'query' => [
                    'key' => $this->apiKey
                ],
                'json' => $payload,
                'headers' => [
                    'Content-Type' => 'application/json'
                ]
            ]);

            $data = $response->toArray();

            if (isset($data['data']['translations']) && is_array($data['data']['translations'])) {
                // Mettre en cache les nouvelles traductions et les ajouter au résultat
                foreach ($data['data']['translations'] as $i => $translation) {
                    $translatedText = $translation['translatedText'] ?? '';
                    $originalIndex = $textIndices[$i];
                    $originalText = $textsToTranslate[$i];
                    
                    // Mettre en cache
                    $cacheKey = md5($originalText . '_' . $targetLang . '_' . ($sourceLang ?? 'auto'));
                    $cacheItem = $this->cache->getItem($cacheKey);
                    $cacheItem->set($translatedText);
                    $this->cache->save($cacheItem);
                    
                    // Ajouter au résultat final
                    $result[$originalIndex] = $translatedText;
                }
            } else {
                throw new \Exception('Erreur de traduction batch: format de réponse inattendu');
            }
            
            ksort($result); // Remettre dans l'ordre original
            return $result;
            
        } catch (\Exception $e) {
            // En cas d'erreur, retourner les textes originaux
            foreach ($textIndices as $i => $originalIndex) {
                $result[$originalIndex] = $textsToTranslate[$i];
            }
            ksort($result);
            
            throw new \Exception('Erreur lors de la traduction batch: ' . $e->getMessage());
        }
    }

    /**
     * Détecte la langue d'un texte
     * 
     * @param string $text Le texte dont on veut détecter la langue
     * @return string Le code de langue détecté
     * @throws \Exception
     */
    public function detectLanguage(string $text): string
    {
        if (empty($text) || trim($text) === '') {
            return 'en'; // Valeur par défaut
        }

        // Clé de cache pour cette détection
        $cacheKey = 'detect_' . md5($text);

        return $this->cache->get($cacheKey, function (ItemInterface $item) use ($text) {
            try {
                $response = $this->httpClient->request('POST', $this->translateEndpoint . '/detect', [
                    'query' => [
                        'key' => $this->apiKey
                    ],
                    'json' => [
                        'q' => $text
                    ],
                    'headers' => [
                        'Content-Type' => 'application/json'
                    ]
                ]);

                $data = $response->toArray();

                if (isset($data['data']['detections'][0][0]['language'])) {
                    return $data['data']['detections'][0][0]['language'];
                }

                return 'en'; // Valeur par défaut
            } catch (\Exception $e) {
                return 'en'; // Valeur par défaut en cas d'erreur
            }
        });
    }

    /**
     * Obtient la liste des langues disponibles
     * 
     * @param string|null $targetLanguage Langue dans laquelle traduire les noms de langues
     * @return array Liste des langues
     */
    public function getAvailableLanguages(?string $targetLanguage = null): array
    {
        $cacheKey = 'languages_' . ($targetLanguage ?? 'none');

        return $this->cache->get($cacheKey, function (ItemInterface $item) use ($targetLanguage) {
            try {
                $queryParams = ['key' => $this->apiKey];
                
                if ($targetLanguage) {
                    $queryParams['target'] = $targetLanguage;
                }

                $response = $this->httpClient->request('GET', $this->translateEndpoint . '/languages', [
                    'query' => $queryParams,
                    'headers' => [
                        'Accept' => 'application/json'
                    ]
                ]);

                $data = $response->toArray();

                if (isset($data['data']['languages']) && is_array($data['data']['languages'])) {
                    return $data['data']['languages'];
                }

                return [];
            } catch (\Exception $e) {
                return [];
            }
        });
    }

    /**
     * Appel à l'API de traduction
     * 
     * @param string $text Texte à traduire
     * @param string $targetLang Langue cible
     * @param string|null $sourceLang Langue source (optionnel)
     * @return string Texte traduit
     * @throws \Exception
     */
    private function callTranslateApi(string $text, string $targetLang, ?string $sourceLang = null): string
    {
        try {
            $payload = [
                'q' => $text,
                'target' => $targetLang,
                'format' => 'text'
            ];

            if ($sourceLang) {
                $payload['source'] = $sourceLang;
            }

            $response = $this->httpClient->request('POST', $this->translateEndpoint, [
                'query' => [
                    'key' => $this->apiKey
                ],
                'json' => $payload,
                'headers' => [
                    'Content-Type' => 'application/json'
                ]
            ]);

            $data = $response->toArray();

            if (isset($data['data']['translations'][0]['translatedText'])) {
                return $data['data']['translations'][0]['translatedText'];
            }

            throw new \Exception('Erreur de traduction: format de réponse inattendu');
        } catch (\Exception $e) {
            // En cas d'erreur API, on retourne le texte original
            return $text;
        }
    }
} 