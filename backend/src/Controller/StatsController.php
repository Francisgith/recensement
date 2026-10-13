<?php

declare(strict_types=1);

namespace App\Controller;

use App\Entity\Individu;
use App\Entity\MembreFamille;
use App\Enum\Sexe;
use App\Repository\IndividuRepository;
use App\Repository\MembreFamilleRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api')]
#[IsGranted('ROLE_AGENT')]
class StatsController extends AbstractController
{
    public function __construct(
        private readonly IndividuRepository $individus,
        private readonly MembreFamilleRepository $membres,
    ) {
    }

    #[Route('/stats/overview', name: 'api_stats_overview', methods: ['GET'])]
    public function overview(): JsonResponse
    {
        /** @var list<Individu> $individus */
        $individus = $this->individus->findAll();
        /** @var list<MembreFamille> $membres */
        $membres = $this->membres->findAll();

        $ages = [];
        $hommes = 0;
        $femmes = 0;

        foreach (array_merge($individus, $membres) as $personne) {
            $ages[] = $personne->getAge() ?? 0;
            if (Sexe::LAHY === $personne->getSexe()) {
                ++$hommes;
            } elseif (Sexe::VAVY === $personne->getSexe()) {
                ++$femmes;
            }
        }

        $count = static fn (callable $predicate): int => \count(array_filter($ages, $predicate));

        return $this->json([
            'individus' => \count($individus),
            'membres' => \count($membres),
            'populationTotale' => \count($ages),
            'hommes' => $hommes,
            'femmes' => $femmes,
            'tranches' => [
                'moins6' => $count(static fn (int $a): bool => $a < 6),
                'de6a24' => $count(static fn (int $a): bool => $a >= 6 && $a <= 24),
                'plus18' => $count(static fn (int $a): bool => $a > 18),
                'plus65' => $count(static fn (int $a): bool => $a > 65),
            ],
        ]);
    }

    #[Route('/population', name: 'api_population_search', methods: ['GET'])]
    public function population(Request $request): JsonResponse
    {
        $sexe = $request->query->get('sexe');
        $min = $request->query->get('min');
        $max = $request->query->get('max');

        $sexe = (\is_string($sexe) && '' !== $sexe) ? $sexe : null;
        $min = is_numeric($min) ? (int) $min : null;
        $max = is_numeric($max) ? (int) $max : null;

        $items = [];

        foreach ($this->individus->search(null, $sexe, $min, $max) as $individu) {
            $items[] = [
                'id' => (string) $individu->getId(),
                'nom' => $individu->getNom(),
                'age' => $individu->getAge(),
                'sexe' => $individu->getSexe()?->value,
                'source' => 'individu',
                'chef' => null,
            ];
        }

        foreach ($this->membres->search(null, $sexe, $min, $max) as $membre) {
            $items[] = [
                'id' => (string) $membre->getId(),
                'nom' => $membre->getNom(),
                'age' => $membre->getAge(),
                'sexe' => $membre->getSexe()?->value,
                'source' => 'membre',
                'chef' => $membre->getChef()?->getNom(),
            ];
        }

        usort($items, static fn (array $a, array $b): int => strcmp((string) $a['nom'], (string) $b['nom']));

        return $this->json([
            'total' => \count($items),
            'items' => $items,
        ], Response::HTTP_OK);
    }
}
