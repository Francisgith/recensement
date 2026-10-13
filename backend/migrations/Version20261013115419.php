<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20261013115419 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE app_user (id INT AUTO_INCREMENT NOT NULL, email VARCHAR(180) NOT NULL, nom VARCHAR(100) NOT NULL, roles JSON NOT NULL, password VARCHAR(255) NOT NULL, actif TINYINT DEFAULT 1 NOT NULL, created_at DATETIME NOT NULL, UNIQUE INDEX UNIQ_USER_EMAIL (email), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE individu (id BINARY(16) NOT NULL, nom VARCHAR(150) NOT NULL, age SMALLINT NOT NULL, sexe VARCHAR(15) NOT NULL, profession VARCHAR(150) DEFAULT NULL, adresse VARCHAR(255) DEFAULT NULL, telephone VARCHAR(30) DEFAULT NULL, created_at DATETIME NOT NULL, updated_at DATETIME NOT NULL, PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE membre_famille (id BINARY(16) NOT NULL, nom VARCHAR(150) NOT NULL, age SMALLINT NOT NULL, sexe VARCHAR(15) NOT NULL, profession VARCHAR(150) DEFAULT NULL, lien VARCHAR(100) DEFAULT NULL, created_at DATETIME NOT NULL, updated_at DATETIME NOT NULL, chef_id BINARY(16) NOT NULL, INDEX IDX_9654F0AE150A48F1 (chef_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('ALTER TABLE membre_famille ADD CONSTRAINT FK_9654F0AE150A48F1 FOREIGN KEY (chef_id) REFERENCES individu (id) ON DELETE CASCADE');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE membre_famille DROP FOREIGN KEY FK_9654F0AE150A48F1');
        $this->addSql('DROP TABLE app_user');
        $this->addSql('DROP TABLE individu');
        $this->addSql('DROP TABLE membre_famille');
    }
}
