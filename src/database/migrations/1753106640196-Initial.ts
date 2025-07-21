import { MigrationInterface, QueryRunner } from "typeorm";

export class Initial1753106640196 implements MigrationInterface {
    name = 'Initial1753106640196'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "health" DROP CONSTRAINT "FK_26eb50270beb7eed6a7fa276794"`);
        await queryRunner.query(`CREATE TABLE "appointment" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "date" TIMESTAMP NOT NULL, "time" character varying NOT NULL, "title" character varying NOT NULL, "description" character varying NOT NULL, "status" character varying NOT NULL DEFAULT 'scheduled', "healthId" uuid NOT NULL, CONSTRAINT "PK_e8be1a53027415e709ce8a2db74" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "appointment" ADD CONSTRAINT "FK_be10e0cf890ae9145c57eda5136" FOREIGN KEY ("healthId") REFERENCES "health"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "health" ADD CONSTRAINT "FK_26eb50270beb7eed6a7fa276794" FOREIGN KEY ("authId") REFERENCES "auth"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "health" DROP CONSTRAINT "FK_26eb50270beb7eed6a7fa276794"`);
        await queryRunner.query(`ALTER TABLE "appointment" DROP CONSTRAINT "FK_be10e0cf890ae9145c57eda5136"`);
        await queryRunner.query(`DROP TABLE "appointment"`);
        await queryRunner.query(`ALTER TABLE "health" ADD CONSTRAINT "FK_26eb50270beb7eed6a7fa276794" FOREIGN KEY ("authId") REFERENCES "auth"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
