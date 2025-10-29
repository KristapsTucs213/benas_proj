/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('uzpildes_stacijas', function(table) {
    table.integer('id').unsigned().primary();
    table.string('tanka_vards', 100).notNullable();
    table.decimal('d_cena', 5, 2).notNullable();
    table.decimal('supd_cena', 5, 2).notNullable();
    table.decimal('95_cena', 5, 2).notNullable();
    table.decimal('98_cena', 5, 2).notNullable();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('uzpildes_stacijas');
};
