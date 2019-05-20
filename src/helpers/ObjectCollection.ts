import _ from "lodash";

/**
 * ObjectCollectionClass
 */
class ObjectCollection {
    public data;

    constructor(data: object = {}) {
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
    public get(path: string, $default?: any): any {
        return _.get(this.data, path, $default);
    }

    /**
     * Has path in object
     * @method
     * @param {string} path
     * @return {boolean}
     */
    public has(path: string): boolean {
        return _.has(this.data, path);
    }

    /**
     * Set value to path of object.
     * @method
     * @param {string} path
     * @param {*} value
     * @return {*}
     */
    public set(path: string, value: any): any {
        return _.set(this.data, path, value);
    }

    /**
     * Unset a path in object.
     * @method
     * @param {string} path
     * @return {boolean}
     */
    public unset(path: string) {
        return _.unset(this.data, path);
    }

    /**
     * Return all data.
     * @returns {*}
     */
    public all() {
        return this.data;
    }
}

export = ObjectCollection;
