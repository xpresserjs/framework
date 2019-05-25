"use strict";
const _ = require("lodash");
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
        return _.get(this.data, path, $default);
    }
    /**
     * Has path in object
     * @method
     * @param {string} path
     * @return {boolean}
     */
    has(path) {
        return _.has(this.data, path);
    }
    /**
     * Set value to path of object.
     * @method
     * @param {string} path
     * @param {*} value
     * @return {*}
     */
    set(path, value) {
        return _.set(this.data, path, value);
    }
    /**
     * Unset a path in object.
     * @method
     * @param {string} path
     * @return {boolean}
     */
    unset(path) {
        return _.unset(this.data, path);
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