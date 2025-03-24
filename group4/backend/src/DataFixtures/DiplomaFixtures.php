<?php

namespace App\DataFixtures;

use App\Entity\Diploma;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;

class DiplomaFixtures extends Fixture
{
    // Références pour les diplômes
    public const DIPLOMA_BAC = 'diploma-bac';
    public const DIPLOMA_BTS = 'diploma-bts';
    public const DIPLOMA_DUT = 'diploma-dut';
    public const DIPLOMA_LICENCE = 'diploma-licence';
    public const DIPLOMA_MASTER = 'diploma-master';
    public const DIPLOMA_DOCTORAT = 'diploma-doctorat';

    public function load(ObjectManager $manager): void
    {
        // Diplômes de l'enseignement secondaire
        $secondaryDiplomas = [
            'Brevet des collèges (DNB)',
            'Certificat d\'aptitude professionnelle (CAP)',
            'Brevet d\'études professionnelles (BEP)',
            'Baccalauréat général - Série L (Littéraire)',
            'Baccalauréat général - Série ES (Économique et Social)',
            'Baccalauréat général - Série S (Scientifique)',
            'Baccalauréat technologique - STI2D (Sciences et Technologies de l\'Industrie et du Développement Durable)',
            'Baccalauréat technologique - STL (Sciences et Technologies de Laboratoire)',
            'Baccalauréat technologique - STMG (Sciences et Technologies du Management et de la Gestion)',
            'Baccalauréat technologique - ST2S (Sciences et Technologies de la Santé et du Social)',
            'Baccalauréat technologique - STD2A (Sciences et Technologies du Design et des Arts Appliqués)',
            'Baccalauréat technologique - STAV (Sciences et Technologies de l\'Agronomie et du Vivant)',
            'Baccalauréat technologique - TMD (Techniques de la Musique et de la Danse)',
            'Baccalauréat professionnel',
        ];

        // Diplômes de l'enseignement supérieur court (Bac+2)
        $shortHigherDiplomas = [
            'Brevet de technicien supérieur (BTS) - Informatique',
            'Brevet de technicien supérieur (BTS) - Commerce',
            'Brevet de technicien supérieur (BTS) - Communication',
            'Brevet de technicien supérieur (BTS) - Gestion',
            'Brevet de technicien supérieur (BTS) - Tourisme',
            'Brevet de technicien supérieur (BTS) - Audiovisuel',
            'Brevet de technicien supérieur (BTS) - Design',
            'Brevet de technicien supérieur (BTS) - Hôtellerie-Restauration',
            'Diplôme universitaire de technologie (DUT) - Informatique',
            'Diplôme universitaire de technologie (DUT) - Gestion des entreprises et des administrations',
            'Diplôme universitaire de technologie (DUT) - Techniques de commercialisation',
            'Diplôme universitaire de technologie (DUT) - Information-Communication',
            'Diplôme universitaire de technologie (DUT) - Génie civil',
            'Diplôme universitaire de technologie (DUT) - Génie électrique et informatique industrielle',
            'Diplôme universitaire de technologie (DUT) - Mesures physiques',
            'Diplôme d\'études universitaires scientifiques et techniques (DEUST)',
            'Diplôme de comptabilité et de gestion (DCG)',
        ];

        // Diplômes de l'enseignement supérieur intermédiaire (Bac+3/+4)
        $intermediateHigherDiplomas = [
            'Licence - Droit',
            'Licence - Économie',
            'Licence - Gestion',
            'Licence - Administration économique et sociale (AES)',
            'Licence - Langues étrangères appliquées (LEA)',
            'Licence - Langues, littératures et civilisations étrangères et régionales (LLCER)',
            'Licence - Lettres',
            'Licence - Histoire',
            'Licence - Géographie',
            'Licence - Sociologie',
            'Licence - Psychologie',
            'Licence - Sciences de l\'éducation',
            'Licence - Mathématiques',
            'Licence - Physique',
            'Licence - Chimie',
            'Licence - Sciences de la vie',
            'Licence - Sciences de la Terre',
            'Licence - Informatique',
            'Licence - STAPS (Sciences et techniques des activités physiques et sportives)',
            'Licence professionnelle - Métiers de l\'informatique',
            'Licence professionnelle - Commerce et distribution',
            'Licence professionnelle - Management et gestion des organisations',
            'Licence professionnelle - Métiers de la communication',
            'Licence professionnelle - Métiers du BTP',
            'Licence professionnelle - Métiers de l\'industrie',
            'Licence professionnelle - Métiers du tourisme et des loisirs',
            'Maîtrise (M1)',
            'Diplôme supérieur de comptabilité et de gestion (DSCG)',
        ];

        // Diplômes de l'enseignement supérieur long (Bac+5 et plus)
        $longHigherDiplomas = [
            'Master - Droit des affaires',
            'Master - Droit public',
            'Master - Droit international',
            'Master - Finance',
            'Master - Marketing',
            'Master - Management',
            'Master - Ressources humaines',
            'Master - Commerce international',
            'Master - Économie',
            'Master - Informatique',
            'Master - Génie logiciel',
            'Master - Intelligence artificielle',
            'Master - Cybersécurité',
            'Master - Data Science',
            'Master - Réseaux et télécommunications',
            'Master - Biologie',
            'Master - Chimie',
            'Master - Physique',
            'Master - Mathématiques',
            'Master - Histoire',
            'Master - Géographie',
            'Master - Sociologie',
            'Master - Psychologie',
            'Master - Sciences de l\'éducation',
            'Master - Langues et cultures étrangères',
            'Master - Lettres modernes',
            'Master - Communication',
            'Master - Journalisme',
            'Master - Arts',
            'Master - Cinéma',
            'Master - Musique',
            'Master - Architecture',
            'Master - Urbanisme',
            'Diplôme d\'ingénieur',
            'Diplôme d\'école de commerce',
            'Diplôme d\'État de docteur en médecine',
            'Diplôme d\'État de docteur en pharmacie',
            'Diplôme d\'État de docteur en chirurgie dentaire',
            'Diplôme d\'État de sage-femme',
            'Diplôme d\'État d\'architecte',
            'Diplôme d\'expertise comptable (DEC)',
        ];

        // Diplômes de recherche
        $researchDiplomas = [
            'Doctorat - Sciences',
            'Doctorat - Lettres',
            'Doctorat - Droit',
            'Doctorat - Économie',
            'Doctorat - Gestion',
            'Doctorat - Médecine',
            'Doctorat - Pharmacie',
            'Doctorat - Arts',
            'Habilitation à diriger des recherches (HDR)',
        ];

        // Diplômes professionnels et certifications
        $professionalDiplomas = [
            'Titre professionnel - Développeur web et web mobile',
            'Titre professionnel - Concepteur développeur d\'applications',
            'Titre professionnel - Technicien supérieur en réseaux informatiques et télécommunications',
            'Titre professionnel - Designer web',
            'Titre professionnel - Gestionnaire de paie',
            'Titre professionnel - Comptable assistant',
            'Titre professionnel - Assistant ressources humaines',
            'Titre professionnel - Secrétaire assistant',
            'Titre professionnel - Vendeur conseil en magasin',
            'Titre professionnel - Responsable de rayon',
            'Certification professionnelle RNCP',
            'Certificat de qualification professionnelle (CQP)',
        ];

        // Diplômes des grandes écoles
        $grandesEcolesDiplomas = [
            'Diplôme de l\'École Polytechnique',
            'Diplôme de l\'École Normale Supérieure (ENS)',
            'Diplôme de l\'École des Hautes Études Commerciales (HEC)',
            'Diplôme de l\'ESSEC Business School',
            'Diplôme de l\'ESCP Business School',
            'Diplôme de l\'EM Lyon Business School',
            'Diplôme de l\'EDHEC Business School',
            'Diplôme de Sciences Po Paris',
            'Diplôme de l\'École Centrale',
            'Diplôme de l\'École des Mines',
            'Diplôme de l\'École des Ponts ParisTech',
            'Diplôme de l\'ENSAE Paris',
            'Diplôme de l\'ENSTA Paris',
            'Diplôme de l\'Institut National des Sciences Appliquées (INSA)',
            'Diplôme de l\'École Nationale Vétérinaire',
            'Diplôme de l\'École Nationale de la Magistrature (ENM)',
            'Diplôme de l\'École Nationale d\'Administration (ENA) / Institut National du Service Public (INSP)',
        ];

        // Institutions françaises d'enseignement
        $institutions = [
            'Université Paris-Sorbonne',
            'Université Pierre et Marie Curie',
            'Université Paris-Saclay',
            'Université de Strasbourg',
            'Université de Lyon',
            'Université de Bordeaux',
            'Université de Toulouse',
            'Université de Montpellier',
            'Université de Lille',
            'Université d\'Aix-Marseille',
            'Université de Nice Sophia Antipolis',
            'Université de Nantes',
            'Université de Rennes',
            'Université de Grenoble Alpes',
            'École Polytechnique',
            'École Normale Supérieure',
            'HEC Paris',
            'ESSEC Business School',
            'ESCP Business School',
            'Sciences Po Paris',
            'École Centrale Paris',
            'École des Mines',
            'École des Ponts ParisTech',
            'Conservatoire National des Arts et Métiers (CNAM)',
            'Institut Universitaire de Technologie (IUT)',
            'Lycée général et technologique',
            'Lycée professionnel',
            'Centre de Formation d\'Apprentis (CFA)',
            'GRETA',
        ];

        // Fusionner tous les diplômes
        $allDiplomas = array_merge(
            $secondaryDiplomas,
            $shortHigherDiplomas,
            $intermediateHigherDiplomas,
            $longHigherDiplomas,
            $researchDiplomas,
            $professionalDiplomas,
            $grandesEcolesDiplomas
        );

        // Créer et persister les diplômes
        foreach ($allDiplomas as $index => $diplomaName) {
            $diploma = new Diploma();
            $diploma->setName($diplomaName);
            
            // Attribuer une institution aléatoire
            $randomInstitution = $institutions[array_rand($institutions)];
            $diploma->setInstitution($randomInstitution);
            
            $manager->persist($diploma);
            
            // Ajouter quelques références pour les diplômes clés
            if ($diplomaName === 'Baccalauréat général - Série S (Scientifique)') {
                $this->addReference(self::DIPLOMA_BAC, $diploma);
            } elseif (strpos($diplomaName, 'Brevet de technicien supérieur (BTS) - Informatique') !== false) {
                $this->addReference(self::DIPLOMA_BTS, $diploma);
            } elseif (strpos($diplomaName, 'Diplôme universitaire de technologie (DUT) - Informatique') !== false) {
                $this->addReference(self::DIPLOMA_DUT, $diploma);
            } elseif ($diplomaName === 'Licence - Informatique') {
                $this->addReference(self::DIPLOMA_LICENCE, $diploma);
            } elseif ($diplomaName === 'Master - Informatique') {
                $this->addReference(self::DIPLOMA_MASTER, $diploma);
            } elseif ($diplomaName === 'Doctorat - Sciences') {
                $this->addReference(self::DIPLOMA_DOCTORAT, $diploma);
            }
        }

        $manager->flush();
    }
} 