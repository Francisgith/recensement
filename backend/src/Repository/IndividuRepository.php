<?php

declare(strict_types=1);

namespace App\Repository;

use App\Entity\Individu;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Individu>
 */
class IndividuRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Individu::class);
    }

    /**
     * @return list<Individu>
     */
    public function search(?string $q = null, ?string $sexe = null, ?int $min = null, ?int $max = null): array
    {
        $qb = $this->createQueryBuilder('i')
            ->orderBy('i.nom', 'ASC');

        if (null !== $q && '' !== trim($q)) {
            $qb->andWhere('LOWER(i.nom) LIKE :q')
                ->setParameter('q', '%'.mb_strtolower(trim($q)).'%');
        }

        if (null !== $sexe && '' !== $sexe) {
            $qb->andWhere('i.sexe = :sexe')->setParameter('sexe', $sexe);
        }

        if (null !== $min) {
            $qb->andWhere('i.age >= :min')->setParameter('min', $min);
        }

        if (null !== $max) {
            $qb->andWhere('i.age <= :max')->setParameter('max', $max);
        }

        /** @var list<Individu> $result */
        $result = $qb->getQuery()->getResult();

        return $result;
    }
}
