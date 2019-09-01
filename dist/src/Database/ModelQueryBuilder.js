"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const objection_1 = require("objection");
const excludeAttrFromCount = ["order", "columns", "limit", "offset"];
class ModelQueryBuilder extends objection_1.QueryBuilder {
    /**
     * CountRows
     * @param count
     * @return {Promise<number>}
     */
    countRows(count = "*") {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.count(count))[0][`count(${count})`];
        });
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
     * Paginate results from Database. This method is same as
     * @ref('Database.forPage') but instead returns pagination
     * meta data as well.
     * @method paginate
     * @param  {Number} page - Current Page Number
     * @param  {Number} perPage - Number of items per Page
     * @return {Object} @multiple([data=Array, page=Number, perPage=Number, total=Number, lastPage=Number])
     */
    paginate(page = 1, perPage = 20) {
        return __awaiter(this, void 0, void 0, function* () {
            const countByQuery = this.clone();
            /**
             * Copy the subQuery fn to the clone query. This will make sure
             * that build uses the extended query builder methods on the
             * cloned query too
             */
            // @ts-ignore
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
            // @ts-ignore
            countByQuery._statements = _.filter(countByQuery._statements, (statement) => {
                return excludeAttrFromCount.indexOf(statement.grouping) < 0;
            });
            const counts = yield countByQuery.count("* as total");
            const total = _.get(counts, "0.total", 0);
            const data = total === 0 ? [] : yield this.forPage(page, perPage);
            return {
                total,
                perPage,
                page,
                lastPage: Math.ceil(total / perPage),
                data,
            };
        });
    }
}
module.exports = ModelQueryBuilder;
