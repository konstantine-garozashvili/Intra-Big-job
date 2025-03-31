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
        
        // Vérifier les paramètres avec support pour les deux formats de paramètres
        if (!isset($data['text'])) {
            return $this->json([
                'success' => false,
                'message' => 'Le paramètre "text" est requis'
            ], 400);
        }
        
        // Support pour les deux formats de paramètres (targetLang/target_language)
        $targetLang = $data['targetLang'] ?? $data['target_language'] ?? null;
        if (!$targetLang) {
            return $this->json([
                'success' => false,
                'message' => 'Le paramètre "targetLang" ou "target_language" est requis'
            ], 400);
        }

        try {
            // Support pour les deux formats de paramètres (sourceLang/source_language)
            $sourceLang = $data['sourceLang'] ?? $data['source_language'] ?? 'fr';
            
            $translatedText = $this->translationService->translateText(
                $data['text'], 
                $targetLang,
                $sourceLang
            );
            
            return $this->json([
                'success' => true,
                'translatedText' => $translatedText,
                'sourceLang' => $sourceLang ?? 'fr'
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
    #[Route('/batch', name: 'api_translate_batch', methods: ['POST'])]
    public function translateBatch(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        
        if (!isset($data['texts']) || !is_array($data['texts'])) {
            return $this->json([
                'success' => false,
                'message' => 'Le paramètre "texts" (tableau) est requis'
            ], 400);
        }
        
        // Support pour les deux formats de paramètres (targetLang/target_language)
        $targetLang = $data['targetLang'] ?? $data['target_language'] ?? null;
        if (!$targetLang) {
            return $this->json([
                'success' => false,
                'message' => 'Le paramètre "targetLang" ou "target_language" est requis'
            ], 400);
        }

        try {
            // Support pour les deux formats de paramètres (sourceLang/source_language)
            $sourceLang = $data['sourceLang'] ?? $data['source_language'] ?? 'fr';
            
            $translatedTexts = $this->translationService->translateBatch(
                $data['texts'], 
                $targetLang,
                $sourceLang
            );
            
            return $this->json([
                'success' => true,
                'translations' => $translatedTexts,
                'sourceLang' => $sourceLang ?? 'fr'
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
            
            // Si la détection échoue ou est ambiguë, considérer le français par défaut
            if (!$detectedLanguage) {
                $detectedLanguage = 'fr';
            }
            
            return $this->json([
                'success' => true,
                'language' => $detectedLanguage
            ]);
        } catch (\Exception $e) {
            return $this->json([
                'success' => false,
                'message' => $e->getMessage(),
                'language' => 'fr' // En cas d'erreur, considérer français par défaut
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
            $targetLang = $request->query->get('target', 'fr');
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