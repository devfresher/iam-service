import { MigrationInterface, QueryRunner } from "typeorm";

export class Initial1752968925345 implements MigrationInterface {
    name = 'Initial1752968925345'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "health" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "firstName" character varying NOT NULL, "lastName" character varying, "phone" character varying, "dob" date, "gender" "public"."health_gender_enum" NOT NULL, "active" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "authId" uuid NOT NULL, CONSTRAINT "UQ_70e09bf16e370f8b09c681fc763" UNIQUE ("phone"), CONSTRAINT "PK_8a1d6d8c0c85c1791b359854e83" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "auth" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "password" text NOT NULL, "email" character varying NOT NULL, "username" character varying, "refreshToken" text, "roles" "public"."auth_roles_enum" array NOT NULL DEFAULT '{patient}', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, CONSTRAINT "UQ_b54f616411ef3824f6a5c06ea46" UNIQUE ("email"), CONSTRAINT "UQ_366ebf23d8f3781bb7bb37abbd1" UNIQUE ("username"), CONSTRAINT "PK_7e416cf6172bc5aec04244f6459" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "health" ADD CONSTRAINT "FK_26eb50270beb7eed6a7fa276794" FOREIGN KEY ("authId") REFERENCES "auth"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "health" DROP CONSTRAINT "FK_26eb50270beb7eed6a7fa276794"`);
        await queryRunner.query(`DROP TABLE "auth"`);
        await queryRunner.query(`DROP TABLE "health"`);
    }

}
