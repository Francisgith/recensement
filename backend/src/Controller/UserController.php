<?php

declare(strict_types=1);

namespace App\Controller;

use App\Dto\UserInput;
use App\Entity\User;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Attribute\MapRequestPayload;
use Symfony\Component\HttpKernel\Exception\ConflictHttpException;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/users')]
#[IsGranted('ROLE_ADMIN')]
class UserController extends AbstractController
{
    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly UserRepository $users,
        private readonly UserPasswordHasherInterface $hasher,
    ) {
    }

    #[Route('', name: 'api_users_list', methods: ['GET'])]
    public function list(): JsonResponse
    {
        return $this->json($this->users->findBy([], ['id' => 'ASC']), Response::HTTP_OK, [], ['groups' => ['user:read']]);
    }

    #[Route('', name: 'api_users_create', methods: ['POST'])]
    public function create(#[MapRequestPayload(validationGroups: ['Default', 'create'])] UserInput $input): JsonResponse
    {
        if (null !== $this->users->findOneBy(['email' => mb_strtolower((string) $input->email)])) {
            throw new ConflictHttpException('Un utilisateur avec cet email existe déjà.');
        }

        $user = (new User())
            ->setEmail((string) $input->email)
            ->setNom((string) $input->nom)
            ->setRoles($input->roles ?? [User::ROLE_AGENT])
            ->setActif($input->actif ?? true);
        $user->setPassword($this->hasher->hashPassword($user, (string) $input->password));

        $this->em->persist($user);
        $this->em->flush();

        return $this->json($user, Response::HTTP_CREATED, [], ['groups' => ['user:read']]);
    }

    #[Route('/{id}', name: 'api_users_update', methods: ['PUT'])]
    public function update(int $id, #[MapRequestPayload] UserInput $input): JsonResponse
    {
        $user = $this->findOrFail($id);

        if (null !== $input->email && $input->email !== $user->getEmail()) {
            $existing = $this->users->findOneBy(['email' => mb_strtolower((string) $input->email)]);
            if (null !== $existing && $existing->getId() !== $user->getId()) {
                throw new ConflictHttpException('Un utilisateur avec cet email existe déjà.');
            }
            $user->setEmail((string) $input->email);
        }

        $user->setNom((string) $input->nom)
            ->setRoles($input->roles ?? $user->getRoles())
            ->setActif($input->actif ?? $user->isActif());

        if (null !== $input->password && '' !== $input->password) {
            $user->setPassword($this->hasher->hashPassword($user, $input->password));
        }

        $this->em->flush();

        return $this->json($user, Response::HTTP_OK, [], ['groups' => ['user:read']]);
    }

    #[Route('/{id}', name: 'api_users_delete', methods: ['DELETE'])]
    public function delete(int $id): JsonResponse
    {
        $user = $this->findOrFail($id);

        if ($user === $this->getUser()) {
            throw new ConflictHttpException('Vous ne pouvez pas supprimer votre propre compte.');
        }

        $this->em->remove($user);
        $this->em->flush();

        return $this->json(null, Response::HTTP_NO_CONTENT);
    }

    private function findOrFail(int $id): User
    {
        $user = $this->users->find($id);
        if (null === $user) {
            throw $this->createNotFoundException('Utilisateur introuvable.');
        }

        return $user;
    }
}
