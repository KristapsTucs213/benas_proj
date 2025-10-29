/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('spending_history', function(table) {
    table.increments('id').primary();
    table.integer('account_id').unsigned().notNullable();
    table.integer('uzpildes_stacijas_id').unsigned().notNullable();
    table.decimal('total_spent', 10, 2).notNullable();
    table.decimal('liters', 10, 2).notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());

    table.foreign('account_id').references('id').inTable('account').onDelete('CASCADE');
    table.foreign('uzpildes_stacijas_id').references('id').inTable('uzpildes_stacijas');
  });
};


/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('spending_history');
};
