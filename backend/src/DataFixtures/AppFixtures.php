<?php

declare(strict_types=1);

namespace App\DataFixtures;

use App\Entity\Individu;
use App\Entity\MembreFamille;
use App\Entity\User;
use App\Enum\Sexe;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

class AppFixtures extends Fixture
{
    public function __construct(private readonly UserPasswordHasherInterface $hasher)
    {
    }

    public function load(ObjectManager $manager): void
    {
        $admin = (new User())->setEmail('admin@recensement.mg')->setNom('Administrateur')->setRoles([User::ROLE_ADMIN]);
        $admin->setPassword($this->hasher->hashPassword($admin, 'Admin@1234'));
        $manager->persist($admin);

        $agent = (new User())->setEmail('agent@recensement.mg')->setNom('Agent de terrain')->setRoles([User::ROLE_AGENT]);
        $agent->setPassword($this->hasher->hashPassword($agent, 'Agent@1234'));
        $manager->persist($agent);

        $individus = [
            ['RAKOTOMENA Christian Eugene', 50, Sexe::LAHY, 'Chauffeur', 'Lot VF 55 Mahamasina', '0340000001'],
            ['RAKOTOMENA Nicolas', 23, Sexe::LAHY, 'Cuisinier', 'Lot VF 55 Mahamasina', '0340000002'],
            ['RANDRIAMBELOSOA Mireille', 40, Sexe::VAVY, 'Commerçante', 'Lot II A 12 Antananarivo', '0340000003'],
        ];

        $chefs = [];
        foreach ($individus as [$nom, $age, $sexe, $profession, $adresse, $tel]) {
            $chef = (new Individu())
                ->setNom($nom)
                ->setAge($age)
                ->setSexe($sexe)
                ->setProfession($profession)
                ->setAdresse($adresse)
                ->setTelephone($tel);
            $manager->persist($chef);
            $chefs[] = $chef;
        }

        $membres = [
            [0, 'RAKOTOMENA Christelle', 19, Sexe::VAVY, 'Mpianatra', 'Fille'],
            [0, 'RAKOTOMENA Fitia Arnelle', 4, Sexe::VAVY, 'Mpianatra', 'Fille'],
            [1, 'RALALANIAINA Annie', 24, Sexe::VAVY, 'Mpianatra', 'Épouse'],
            [2, 'RAKOTOMENA Mitia Arrys', 2, Sexe::VAVY, null, 'Fils'],
        ];

        foreach ($membres as [$chefIndex, $nom, $age, $sexe, $profession, $lien]) {
            $membre = (new MembreFamille())
                ->setNom($nom)
                ->setAge($age)
                ->setSexe($sexe)
                ->setProfession($profession)
                ->setLien($lien)
                ->setChef($chefs[$chefIndex]);
            $manager->persist($membre);
        }

        $manager->flush();
    }
}
