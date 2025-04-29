<?php

namespace App\Form;

use App\Entity\User;
use App\Entity\Nationality;
use App\Entity\Specialization;
use App\Entity\Theme;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\Extension\Core\Type\EmailType;
use Symfony\Component\Form\Extension\Core\Type\DateType;
use Symfony\Component\Form\Extension\Core\Type\PasswordType;
use Symfony\Component\Form\Extension\Core\Type\UrlType;
use Symfony\Bridge\Doctrine\Form\Type\EntityType;

class AddStudentType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $builder
            ->add('firstName', TextType::class)
            ->add('lastName', TextType::class)
            ->add('email', EmailType::class)
            ->add('birthDate', DateType::class, [
                'widget' => 'single_text',
            ])
            ->add('nationality', EntityType::class, [
                'class' => Nationality::class,
                'choice_label' => 'name',
            ])
            ->add('phoneNumber', TextType::class, [
                'required' => false,
            ])
            ->add('specialization', EntityType::class, [
                'class' => Specialization::class,
                'choice_label' => 'name',
                'required' => false,
            ])
            ->add('password', PasswordType::class)
            ->add('linkedinUrl', UrlType::class, [
                'required' => false,
            ])
            ->add('theme', EntityType::class, [
                'class' => Theme::class,
                'choice_label' => 'name',
                'required' => true,
            ])
        ;
    }

    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'data_class' => User::class,
        ]);
    }
}
