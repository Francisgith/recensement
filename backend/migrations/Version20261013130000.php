<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20261013130000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Change photo column to TEXT for base64 images';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE individu MODIFY photo TEXT DEFAULT NULL');
        $this->addSql('ALTER TABLE membre_famille MODIFY photo TEXT DEFAULT NULL');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE individu MODIFY photo VARCHAR(255) DEFAULT NULL');
        $this->addSql('ALTER TABLE membre_famille MODIFY photo VARCHAR(255) DEFAULT NULL');
    }
}
