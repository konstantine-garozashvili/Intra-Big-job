<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Form\Extension\Core\Type\SubmitType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class TestController extends AbstractController
{
    #[Route('/test-form', name: 'test_form', methods: ['GET', 'POST'])]
    public function testForm(Request $request): Response
    {
        // Crée un formulaire minimal (un seul champ texte + bouton de soumission)
        $form = $this->createFormBuilder()
            ->add('testField', TextType::class, [
                'label' => 'Test Field',
            ])
            ->add('submit', SubmitType::class, [
                'label' => 'Envoyer',
            ])
            ->getForm();

        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            // Redirige vers une autre page, par exemple, la liste des formations
            return $this->redirectToRoute('formation_list');
        }

        return $this->render('test/form.html.twig', [
            'form' => $form->createView(),
        ]);
    }
}
