import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey } from 'typeorm';

export class AddUserAndRelations1709000000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add user_id to fisheries table
        await queryRunner.addColumn(
            'fisheries',
            new TableColumn({
                name: 'user_id',
                type: 'int',
                isNullable: true,
            }),
        );

        // Add user_id to achievements table
        await queryRunner.addColumn(
            'achievements',
            new TableColumn({
                name: 'user_id',
                type: 'int',
                isNullable: true,
            }),
        );

        // Add fish_id to fish_tracking table
        await queryRunner.addColumn(
            'fish_tracking',
            new TableColumn({
                name: 'fish_id',
                type: 'int',
                isNullable: true,
            }),
        );

        // Add foreign key constraints
        await queryRunner.createForeignKey(
            'fisheries',
            new TableForeignKey({
                columnNames: ['user_id'],
                referencedColumnNames: ['id'],
                referencedTableName: 'users',
                onDelete: 'SET NULL',
            }),
        );

        await queryRunner.createForeignKey(
            'achievements',
            new TableForeignKey({
                columnNames: ['user_id'],
                referencedColumnNames: ['id'],
                referencedTableName: 'users',
                onDelete: 'SET NULL',
            }),
        );

        await queryRunner.createForeignKey(
            'fish_tracking',
            new TableForeignKey({
                columnNames: ['fish_id'],
                referencedColumnNames: ['id'],
                referencedTableName: 'fish',
                onDelete: 'SET NULL',
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove foreign key constraints
        const fisheryTable = await queryRunner.getTable('fisheries');
        const fisheryForeignKey = fisheryTable.foreignKeys.find(
            fk => fk.columnNames.indexOf('user_id') !== -1,
        );
        await queryRunner.dropForeignKey('fisheries', fisheryForeignKey);

        const achievementTable = await queryRunner.getTable('achievements');
        const achievementForeignKey = achievementTable.foreignKeys.find(
            fk => fk.columnNames.indexOf('user_id') !== -1,
        );
        await queryRunner.dropForeignKey('achievements', achievementForeignKey);

        const fishTrackingTable = await queryRunner.getTable('fish_tracking');
        const fishTrackingForeignKey = fishTrackingTable.foreignKeys.find(
            fk => fk.columnNames.indexOf('fish_id') !== -1,
        );
        await queryRunner.dropForeignKey('fish_tracking', fishTrackingForeignKey);

        // Remove columns
        await queryRunner.dropColumn('fisheries', 'user_id');
        await queryRunner.dropColumn('achievements', 'user_id');
        await queryRunner.dropColumn('fish_tracking', 'fish_id');
    }
} 