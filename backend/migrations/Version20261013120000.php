<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20261013120000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add photo column to individu and membre_famille tables';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE individu ADD photo VARCHAR(255) DEFAULT NULL');
        $this->addSql('ALTER TABLE membre_famille ADD photo VARCHAR(255) DEFAULT NULL');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE individu DROP photo');
        $this->addSql('ALTER TABLE membre_famille DROP photo');
    }
}
