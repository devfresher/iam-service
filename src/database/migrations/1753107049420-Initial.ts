import { MigrationInterface, QueryRunner } from "typeorm";

export class Initial1753107049420 implements MigrationInterface {
    name = 'Initial1753107049420'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "appointment" DROP COLUMN "date"`);
        await queryRunner.query(`ALTER TABLE "appointment" DROP COLUMN "time"`);
        await queryRunner.query(`ALTER TABLE "appointment" ADD "appointmentAt" TIMESTAMP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "appointment" DROP COLUMN "appointmentAt"`);
        await queryRunner.query(`ALTER TABLE "appointment" ADD "time" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "appointment" ADD "date" TIMESTAMP NOT NULL`);
    }

}
