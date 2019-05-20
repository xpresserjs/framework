// @ts-check
const {Model, QueryBuilder} = require('objection');
const excludeAttrFromCount = ['order', 'columns', 'limit', 'offset'];


if ($.config.database.startOnBoot) {
    Model.knex($.db.knex);
}


class ModelQueryBuilder extends QueryBuilder {
    /**
     * CountRows
     * @param count
     * @return {Promise<number>}
     */
    async countRows(count = '*') {
        return (await this.count(count))[0][`count(${count})`];
    }

    /**
     * Paginate without meta data
     * @param page - Current Page Number
     * @param perPage - Number of items per Page
     * @return {*}
     */
    forPage(page = 1, perPage = 20) {
        const offset = page === 1 ? 0 : perPage * (page - 1);
        return this.offset(offset).limit(perPage);
    }

    /**
     * Paginate results from database. This method is same as
     * @ref('Database.forPage') but instead returns pagination
     * meta data as well.
     * @method paginate
     * @param  {Number} page - Current Page Number
     * @param  {Number} perPage - Number of items per Page
     * @return {Object} @multiple([data=Array, page=Number, perPage=Number, total=Number, lastPage=Number])
     */
    async paginate(page = 1, perPage = 20) {
        const countByQuery = this.clone();

        /**
         * Copy the subQuery fn to the clone query. This will make sure
         * that build uses the extended query builder methods on the
         * cloned query too
         */
        countByQuery.subQuery = this.subQuery;

        /**
         * Force cast page and perPage to numbers
         */
        page = Number(page);
        perPage = Number(perPage);

        /**
         * Remove statements that will make things bad with count
         * query, for example `orderBy`
         */
        countByQuery._statements = _.filter(countByQuery._statements, (statement) => {
            return excludeAttrFromCount.indexOf(statement.grouping) < 0
        });

        const counts = await countByQuery.count('* as total');
        const total = _.get(counts, '0.total', 0);
        const data = total === 0 ? [] : await this.forPage(page, perPage);

        return {
            total: total,
            perPage: perPage,
            page: page,
            lastPage: Math.ceil(total / perPage),
            data: data
        }
    }
}

class ModelEngine extends Model {
    static get QueryBuilder() {
        return ModelQueryBuilder;
    }

    $formatJson(json) {
        return _.omit(json, this.$hidden);
    };

    $beforeInsert() {
        const timestamp = moment(new Date().toISOString()).format($.config.database.timestampFormat);
        this.created_at = timestamp;
        this.updated_at = timestamp;
    }

    $beforeUpdate() {
        this.updated_at = moment(new Date().toISOString()).format($.config.database.timestampFormat);
    }
}


ModelEngine.prototype.$hidden = [];

module.exports = ModelEngine;