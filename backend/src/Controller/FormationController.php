<?php

namespace App\Controller;

use App\Entity\Formation;
use App\Form\AddStudentType;
use App\Repository\FormationRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class FormationController extends AbstractController
{
    /**
     * Affiche la liste de toutes les formations.
     */
    #[Route('/formations', name: 'formation_list', methods: ['GET'])]
    public function list(FormationRepository $formationRepository): Response
    {
        $formations = $formationRepository->findAll();

        return $this->render('formation/list.html.twig', [
            'formations' => $formations,
        ]);
    }

    /**
     * Affiche le formulaire pour ajouter des étudiants à une formation donnée.
     * La formation est récupérée automatiquement via l'ID dans l'URL.
     */
    #[Route('/formation/{id}/add-students', name: 'formation_add_students', methods: ['GET', 'POST'])]
    public function addStudents(Formation $formation, Request $request, EntityManagerInterface $em): Response
    {
        $form = $this->createForm(AddStudentType::class, $formation);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            // La relation ManyToMany se met à jour grâce aux setters de l'entité Formation.
            $em->flush();

            $this->addFlash('success', 'Les étudiants ont été ajoutés à la formation.');
            return $this->redirectToRoute('formation_list');
        }

        return $this->render('formation/add_students.html.twig', [
            'formation' => $formation,
            'form' => $form->createView(),
        ]);
    }
}
