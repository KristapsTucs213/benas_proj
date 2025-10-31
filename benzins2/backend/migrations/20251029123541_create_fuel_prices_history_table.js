/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('fuel_prices_history', function(table) {
    table.increments('id').primary();
    table.integer('uzpildes_stacijas_id').unsigned().notNullable();
    table.decimal('d_cena', 5, 2).notNullable();
    table.decimal('supd_cena', 5, 2).notNullable();
    table.decimal('95_cena', 5, 2).notNullable();
    table.decimal('98_cena', 5, 2).notNullable();
    table.string('d_desc', 500).nullable();
    table.string('supd_desc', 500).nullable();
    table.string('95_desc', 500).nullable();
    table.string('98_desc', 500).nullable();
    table.timestamp('timestamps').defaultTo(knex.fn.now());

    table.foreign('uzpildes_stacijas_id').references('id').inTable('uzpildes_stacijas');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

exports.down = function(knex) {
  return knex.schema.dropTable('fuel_prices_history');
};
