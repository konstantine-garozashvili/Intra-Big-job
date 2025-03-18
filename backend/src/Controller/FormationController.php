<?php

namespace App\Controller;

use App\Entity\Formation;
use App\Form\AddStudentType;
use App\Form\FormationType;
use App\Repository\FormationRepository;
use Doctrine\ORM\EntityManagerInterface;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class FormationController extends AbstractController
{
    /**
     * Affiche la liste de toutes les formations.
     */
    #[Security("is_granted('ROLE_RECRUTEUR') or is_granted('ROLE_RH') or is_granted('ROLE_ADMIN') or is_granted('ROLE_SUPERADMIN')")]
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
    #[Security("is_granted('ROLE_RECRUTEUR') or is_granted('ROLE_RH') or is_granted('ROLE_ADMIN') or is_granted('ROLE_SUPERADMIN')")]
    #[Route('/formation/{id}/add-students', name: 'formation_add_students', methods: ['GET', 'POST'])]
    public function addStudents(Formation $formation, Request $request, EntityManagerInterface $em): Response
    {
        $form = $this->createForm(AddStudentType::class, $formation);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            $em->flush();
            $this->addFlash('success', 'Les étudiants ont été ajoutés à la formation.');
            return $this->redirectToRoute('formation_list');
        }

        return $this->render('formation/add_students.html.twig', [
            'formation' => $formation,
            'form' => $form->createView(),
        ]);
    }

    /**
     * (Optionnel) Affiche le formulaire pour créer une nouvelle formation.
     */
    #[Security("is_granted('ROLE_RECRUTEUR') or is_granted('ROLE_RH') or is_granted('ROLE_ADMIN') or is_granted('ROLE_SUPERADMIN')")]
    #[Route('/formation/new', name: 'formation_new', methods: ['GET', 'POST'])]
    public function new(Request $request, EntityManagerInterface $em): Response
    {
        $formation = new Formation();
        $form = $this->createForm(FormationType::class, $formation);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            $em->persist($formation);
            $em->flush();
            $this->addFlash('success', 'La formation a été créée avec succès.');
            return $this->redirectToRoute('formation_list');
        }

        return $this->render('formation/new.html.twig', [
            'form' => $form->createView(),
        ]);
    }
}
