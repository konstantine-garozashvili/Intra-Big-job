<?php

namespace App\Controller;

use App\Service\TranslationService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api/translation')]
class TranslationController extends AbstractController
{
    private TranslationService $translationService;

    public function __construct(TranslationService $translationService)
    {
        $this->translationService = $translationService;
    }

    /**
     * Traduit un texte
     */
    #[Route('/translate', name: 'api_translate_text', methods: ['POST'])]
    public function translateText(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        
        if (!isset($data['text']) || !isset($data['targetLang'])) {
            return $this->json([
                'success' => false,
                'message' => 'Les paramètres "text" et "targetLang" sont requis'
            ], 400);
        }

        try {
            $sourceLang = $data['sourceLang'] ?? null;
            $translatedText = $this->translationService->translateText(
                $data['text'], 
                $data['targetLang'],
                $sourceLang
            );
            
            return $this->json([
                'success' => true,
                'translatedText' => $translatedText,
                'sourceLang' => $sourceLang ?? 'auto'
            ]);
        } catch (\Exception $e) {
            return $this->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Traduit un ensemble de textes
     */
    #[Route('/translate-batch', name: 'api_translate_batch', methods: ['POST'])]
    public function translateBatch(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        
        if (!isset($data['texts']) || !is_array($data['texts']) || !isset($data['targetLang'])) {
            return $this->json([
                'success' => false,
                'message' => 'Les paramètres "texts" (tableau) et "targetLang" sont requis'
            ], 400);
        }

        try {
            $sourceLang = $data['sourceLang'] ?? null;
            $translatedTexts = $this->translationService->translateBatch(
                $data['texts'], 
                $data['targetLang'],
                $sourceLang
            );
            
            return $this->json([
                'success' => true,
                'translatedTexts' => $translatedTexts,
                'sourceLang' => $sourceLang ?? 'auto'
            ]);
        } catch (\Exception $e) {
            return $this->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Détecte la langue d'un texte
     */
    #[Route('/detect', name: 'api_detect_language', methods: ['POST'])]
    public function detectLanguage(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        
        if (!isset($data['text'])) {
            return $this->json([
                'success' => false,
                'message' => 'Le paramètre "text" est requis'
            ], 400);
        }

        try {
            $detectedLanguage = $this->translationService->detectLanguage($data['text']);
            
            return $this->json([
                'success' => true,
                'language' => $detectedLanguage
            ]);
        } catch (\Exception $e) {
            return $this->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtient la liste des langues disponibles
     */
    #[Route('/languages', name: 'api_languages', methods: ['GET'])]
    public function getLanguages(Request $request): JsonResponse
    {
        try {
            $targetLang = $request->query->get('target');
            $languages = $this->translationService->getAvailableLanguages($targetLang);
            
            return $this->json([
                'success' => true,
                'languages' => $languages
            ]);
        } catch (\Exception $e) {
            return $this->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }
} 