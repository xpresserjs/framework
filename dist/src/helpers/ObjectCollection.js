"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const lodash_1 = __importDefault(require("lodash"));
/**
 * ObjectCollectionClass
 */
class ObjectCollection {
    constructor(data = {}) {
        this.data = data;
        return this;
    }
    /**
     * Get path of object or return.
     * @method
     * @param {string} path
     * @param {*} [$default]
     * @return {*}
     */
    get(path, $default) {
        return lodash_1.default.get(this.data, path, $default);
    }
    /**
     * Has path in object
     * @method
     * @param {string} path
     * @return {boolean}
     */
    has(path) {
        return lodash_1.default.has(this.data, path);
    }
    /**
     * Set value to path of object.
     * @method
     * @param {string} path
     * @param {*} value
     * @return {*}
     */
    set(path, value) {
        return lodash_1.default.set(this.data, path, value);
    }
    /**
     * Unset a path in object.
     * @method
     * @param {string} path
     * @return {boolean}
     */
    unset(path) {
        return lodash_1.default.unset(this.data, path);
    }
    /**
     * Push to array in object
     * @param path
     * @param value
     */
    push(path, value) {
        const storedValue = this.get(path, []);
        if (Array.isArray(storedValue)) {
            const pushed = storedValue.push(value);
            this.set(path, storedValue);
            return pushed;
        }
        return false;
    }
    /**
     * Add Key and Value to Object
     * @param path
     * @param $object
     */
    addToObject(path, $object) {
        const storedValue = this.get(path, {});
        if (typeof storedValue === "object") {
            storedValue[$object.key] = $object.value;
            this.set(path, storedValue);
        }
        return false;
    }
    /**
     * Return all data.
     * @returns {*}
     */
    all() {
        return this.data;
    }
}
module.exports = ObjectCollection;
//# sourceMappingURL=ObjectCollection.js.map