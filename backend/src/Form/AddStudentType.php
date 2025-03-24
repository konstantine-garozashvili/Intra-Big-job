<?php

namespace App\Form;

use App\Entity\Formation;
use App\Entity\User;
use Symfony\Bridge\Doctrine\Form\Type\EntityType;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class AddStudentType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $builder->add('students', EntityType::class, [
            'class' => User::class,
            'choice_label' => function (User $user) {
                return $user->getFirstName() . ' ' . $user->getLastName() . ' (' . $user->getEmail() . ')';
            },
            'multiple' => true,
            'expanded' => true,
            'query_builder' => function (\Doctrine\ORM\EntityRepository $er) {
                return $er->createQueryBuilder('u')
                    ->innerJoin('u.userRoles', 'ur')
                    ->innerJoin('ur.role', 'r')
                    ->where('r.name = :role')
                    ->setParameter('role', 'STUDENT');
            },
            'required' => false,
        ]);
    }

    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'data_class' => Formation::class,
        ]);
    }
}
