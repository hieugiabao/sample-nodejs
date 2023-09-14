import { MigrationInterface, QueryRunner } from "typeorm"

export class AddUser1693329015780 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TYPE "users_role_enum" AS ENUM('admin', 'user')
        `)
        await queryRunner.query(`
            CREATE TABLE "users" (
                "id" SERIAL NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "username" character varying(50) NOT NULL,
                "email" character varying NOT NULL,
                "password" character varying NOT NULL,
                "role" "users_role_enum" NOT NULL DEFAULT 'user',
                "name" character varying,
                "avatar_url" character varying,
                "location" character varying,
                "bio" character varying,
                CONSTRAINT "UQ_78a916df40e02a9deb1c4b75edb" UNIQUE ("username"),
                CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"),
                CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id")
            )
        `)

    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
        DROP TABLE "users"
        `)
        await queryRunner.query(`
            DROP TYPE "users_role_enum"
        `)
    }

}
