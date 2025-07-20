import { MigrationInterface, QueryRunner } from "typeorm";

export class Initial1752974250220 implements MigrationInterface {
    name = 'Initial1752974250220'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "health" DROP CONSTRAINT "UQ_70e09bf16e370f8b09c681fc763"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "health" ADD CONSTRAINT "UQ_70e09bf16e370f8b09c681fc763" UNIQUE ("phone")`);
    }

}
