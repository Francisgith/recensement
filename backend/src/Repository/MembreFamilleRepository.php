<?php

declare(strict_types=1);

namespace App\Repository;

use App\Entity\MembreFamille;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<MembreFamille>
 */
class MembreFamilleRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, MembreFamille::class);
    }

    /**
     * @return list<MembreFamille>
     */
    public function search(?string $q = null, ?string $sexe = null, ?int $min = null, ?int $max = null): array
    {
        $qb = $this->createQueryBuilder('m')
            ->leftJoin('m.chef', 'c')
            ->addSelect('c')
            ->orderBy('m.nom', 'ASC');

        if (null !== $q && '' !== trim($q)) {
            $qb->andWhere('LOWER(m.nom) LIKE :q')
                ->setParameter('q', '%'.mb_strtolower(trim($q)).'%');
        }

        if (null !== $sexe && '' !== $sexe) {
            $qb->andWhere('m.sexe = :sexe')->setParameter('sexe', $sexe);
        }

        if (null !== $min) {
            $qb->andWhere('m.age >= :min')->setParameter('min', $min);
        }

        if (null !== $max) {
            $qb->andWhere('m.age <= :max')->setParameter('max', $max);
        }

        /** @var list<MembreFamille> $result */
        $result = $qb->getQuery()->getResult();

        return $result;
    }
}
