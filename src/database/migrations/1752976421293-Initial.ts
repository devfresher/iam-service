import { MigrationInterface, QueryRunner } from "typeorm";

export class Initial1752976421293 implements MigrationInterface {
    name = 'Initial1752976421293'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "auth" ADD "status" boolean NOT NULL DEFAULT true`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "auth" DROP COLUMN "status"`);
    }

}
