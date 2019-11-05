/**
 * @param {knex} knex
 * @return {*}
 */
exports.up = function (knex) {
    return knex.schema.createTable('', ($table) => {

        //$table.increments('id');
        //$table.timestamps(true, true);

    });
};

/**
 * @param {knex} knex
 * @return {*}
 */
exports.down = function (knex) {
    return knex.schema.dropTableIfExists('');
};
