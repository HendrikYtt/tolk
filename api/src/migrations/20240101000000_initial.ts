import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    // Application errors table (for error logging)
    await knex.schema.createTable('application_errors', (table) => {
        table.increments('id').primary();
        table.string('cid').notNullable().index();
        table.text('error_message').notNullable();
        table.text('error_stack');
        table.string('request_method', 10);
        table.string('request_path', 500);
        table.text('request_body');
        table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable();
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists('application_errors');
}
