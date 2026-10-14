<?php

declare(strict_types=1);

namespace App\Controller;

use App\Dto\MembreFamilleInput;
use App\Entity\Individu;
use App\Entity\MembreFamille;
use App\Repository\IndividuRepository;
use App\Repository\MembreFamilleRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Attribute\MapRequestPayload;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Component\Uid\Uuid;

#[Route('/api/membres')]
#[IsGranted('ROLE_AGENT')]
class MembreFamilleController extends AbstractController
{
    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly MembreFamilleRepository $membres,
        private readonly IndividuRepository $individus,
    ) {
    }

    #[Route('', name: 'api_membres_list', methods: ['GET'])]
    public function list(Request $request): JsonResponse
    {
        $q = $request->query->get('q');
        $sexe = $request->query->get('sexe');
        $min = $request->query->get('min');
        $max = $request->query->get('max');
        $chef = $request->query->get('chef');

        if (\is_string($chef) && '' !== $chef && Uuid::isValid($chef)) {
            $individu = $this->individus->find(Uuid::fromString($chef));
            $data = null === $individu ? [] : $individu->getMembres()->getValues();

            return $this->json($data, Response::HTTP_OK, [], ['groups' => ['membre:read']]);
        }

        $membres = $this->membres->search(
            \is_string($q) ? $q : null,
            \is_string($sexe) ? $sexe : null,
            is_numeric($min) ? (int) $min : null,
            is_numeric($max) ? (int) $max : null,
        );

        return $this->json($membres, Response::HTTP_OK, [], ['groups' => ['membre:read']]);
    }

    #[Route('/{id}', name: 'api_membres_get', methods: ['GET'])]
    public function get(string $id): JsonResponse
    {
        return $this->json($this->findOrFail($id), Response::HTTP_OK, [], ['groups' => ['membre:read']]);
    }

    #[Route('', name: 'api_membres_create', methods: ['POST'])]
    public function create(#[MapRequestPayload] MembreFamilleInput $input): JsonResponse
    {
        $membre = new MembreFamille();
        $this->apply($membre, $input);

        $this->em->persist($membre);
        $this->em->flush();

        return $this->json($membre, Response::HTTP_CREATED, [], ['groups' => ['membre:read']]);
    }

    #[Route('/{id}', name: 'api_membres_update', methods: ['PUT'])]
    public function update(string $id, #[MapRequestPayload] MembreFamilleInput $input): JsonResponse
    {
        $membre = $this->findOrFail($id);
        $this->apply($membre, $input);
        $this->em->flush();

        return $this->json($membre, Response::HTTP_OK, [], ['groups' => ['membre:read']]);
    }

    #[Route('/{id}', name: 'api_membres_delete', methods: ['DELETE'])]
    public function delete(string $id): JsonResponse
    {
        $membre = $this->findOrFail($id);
        $this->em->remove($membre);
        $this->em->flush();

        return $this->json(null, Response::HTTP_NO_CONTENT);
    }

    private function apply(MembreFamille $membre, MembreFamilleInput $input): void
    {
        $chef = $this->resolveChef((string) $input->chef);

        $membre
            ->setNom((string) $input->nom)
            ->setAge((int) $input->age)
            ->setSexe($input->sexe)
            ->setProfession($input->profession)
            ->setLien($input->lien)
            ->setPhoto($input->photo)
            ->setChef($chef);
    }

    private function resolveChef(string $chefId): Individu
    {
        if (false === Uuid::isValid($chefId)) {
            throw $this->createNotFoundException('Identifiant du chef invalide.');
        }

        $chef = $this->individus->find(Uuid::fromString($chefId));
        if (null === $chef) {
            throw $this->createNotFoundException('Chef de famille introuvable.');
        }

        return $chef;
    }

    private function findOrFail(string $id): MembreFamille
    {
        if (false === Uuid::isValid($id)) {
            throw $this->createNotFoundException('Identifiant invalide.');
        }

        $membre = $this->membres->find(Uuid::fromString($id));
        if (null === $membre) {
            throw $this->createNotFoundException('Membre introuvable.');
        }

        return $membre;
    }
}
