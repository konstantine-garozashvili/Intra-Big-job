<?php

namespace App\Controller;

use App\Entity\Product;
use App\Repository\ProductRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/information')]
class InformationController extends AbstractController
{
    #[Route('/', name: 'app_information')]
    public function index(ProductRepository $productRepository): Response
    {
        $products = $productRepository->findAll();
        $newProduct = new Product();

        return $this->render('information/index.html.twig', [
            'products' => $products,
            'new_product' => $newProduct,
        ]);
    }

    #[Route('/new', name: 'app_product_new', methods: ['POST'])]
    public function new(Request $request, EntityManagerInterface $entityManager): Response
    {
        $product = new Product();
        $product->setName($request->request->get('name'))
            ->setDescription($request->request->get('description'))
            ->setPrice((float)$request->request->get('price'))
            ->setIsAvailable($request->request->get('isAvailable') === 'on');

        $entityManager->persist($product);
        $entityManager->flush();

        $this->addFlash('success', 'Produit créé avec succès !');
        return $this->redirectToRoute('app_information');
    }

    #[Route('/{id}/edit', name: 'app_product_edit', methods: ['POST'])]
    public function edit(Request $request, Product $product, EntityManagerInterface $entityManager): Response
    {
        $product->setName($request->request->get('name'))
            ->setDescription($request->request->get('description'))
            ->setPrice((float)$request->request->get('price'))
            ->setIsAvailable($request->request->get('isAvailable') === 'on');

        $entityManager->flush();

        $this->addFlash('success', 'Produit modifié avec succès !');
        return $this->redirectToRoute('app_information');
    }

    #[Route('/{id}/delete', name: 'app_product_delete', methods: ['POST'])]
    public function delete(Product $product, EntityManagerInterface $entityManager): Response
    {
        $entityManager->remove($product);
        $entityManager->flush();

        $this->addFlash('success', 'Produit supprimé avec succès !');
        return $this->redirectToRoute('app_information');
    }
} 