<?php

declare(strict_types=1);

namespace App\Controller;

use App\Dto\IndividuInput;
use App\Entity\Individu;
use App\Repository\IndividuRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Attribute\MapRequestPayload;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Component\Uid\Uuid;

#[Route('/api/individus')]
#[IsGranted('ROLE_AGENT')]
class IndividuController extends AbstractController
{
    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly IndividuRepository $individus,
    ) {
    }

    #[Route('', name: 'api_individus_list', methods: ['GET'])]
    public function list(Request $request): JsonResponse
    {
        $q = $request->query->get('q');
        $sexe = $request->query->get('sexe');
        $min = $request->query->get('min');
        $max = $request->query->get('max');

        $individus = $this->individus->search(
            \is_string($q) ? $q : null,
            \is_string($sexe) ? $sexe : null,
            is_numeric($min) ? (int) $min : null,
            is_numeric($max) ? (int) $max : null,
        );

        return $this->json($individus, Response::HTTP_OK, [], ['groups' => ['individu:read']]);
    }

    #[Route('/{id}', name: 'api_individus_get', methods: ['GET'])]
    public function get(string $id): JsonResponse
    {
        return $this->json($this->findOrFail($id), Response::HTTP_OK, [], ['groups' => ['individu:read']]);
    }

    #[Route('', name: 'api_individus_create', methods: ['POST'])]
    public function create(#[MapRequestPayload] IndividuInput $input): JsonResponse
    {
        $individu = new Individu();
        $this->apply($individu, $input);

        $this->em->persist($individu);
        $this->em->flush();

        return $this->json($individu, Response::HTTP_CREATED, [], ['groups' => ['individu:read']]);
    }

    #[Route('/{id}', name: 'api_individus_update', methods: ['PUT'])]
    public function update(string $id, #[MapRequestPayload] IndividuInput $input): JsonResponse
    {
        $individu = $this->findOrFail($id);
        $this->apply($individu, $input);
        $this->em->flush();

        return $this->json($individu, Response::HTTP_OK, [], ['groups' => ['individu:read']]);
    }

    #[Route('/{id}', name: 'api_individus_delete', methods: ['DELETE'])]
    public function delete(string $id): JsonResponse
    {
        $individu = $this->findOrFail($id);
        $this->em->remove($individu);
        $this->em->flush();

        return $this->json(null, Response::HTTP_NO_CONTENT);
    }

    #[Route('/{id}/membres', name: 'api_individus_membres', methods: ['GET'])]
    public function membres(string $id): JsonResponse
    {
        $individu = $this->findOrFail($id);

        return $this->json($individu->getMembres()->getValues(), Response::HTTP_OK, [], ['groups' => ['membre:read']]);
    }

    private function apply(Individu $individu, IndividuInput $input): void
    {
        $individu
            ->setNom((string) $input->nom)
            ->setAge((int) $input->age)
            ->setSexe($input->sexe)
            ->setProfession($input->profession)
            ->setAdresse($input->adresse)
            ->setTelephone($input->telephone)
            ->setPhoto($input->photo);
    }

    private function findOrFail(string $id): Individu
    {
        if (false === Uuid::isValid($id)) {
            throw $this->createNotFoundException('Identifiant invalide.');
        }

        $individu = $this->individus->find(Uuid::fromString($id));
        if (null === $individu) {
            throw $this->createNotFoundException('Individu introuvable.');
        }

        return $individu;
    }
}
