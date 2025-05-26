import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class UpdateUserTable1709000000001 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add email column
        await queryRunner.addColumn(
            'users',
            new TableColumn({
                name: 'email',
                type: 'varchar',
                length: '255',
                isNullable: false,
            }),
        );

        // Add role column
        await queryRunner.addColumn(
            'users',
            new TableColumn({
                name: 'role',
                type: 'varchar',
                length: '50',
                isNullable: false,
                default: "'user'",
            }),
        );

        // Rename disabled to is_active
        await queryRunner.renameColumn('users', 'disabled', 'is_active');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove email column
        await queryRunner.dropColumn('users', 'email');

        // Remove role column
        await queryRunner.dropColumn('users', 'role');

        // Rename is_active back to disabled
        await queryRunner.renameColumn('users', 'is_active', 'disabled');
    }
} 