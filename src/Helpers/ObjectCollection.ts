import _ = require("lodash");

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
     * Return path as an instance of object validator
     * @param path
     * @param $default
     */
    public getNewInstance(path: string, $default = undefined): ObjectCollection {
        return new ObjectCollection(this.get(path, $default));
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
     * Count Keys in Object
     */
    public count() {
        return Object.keys(this.data).length;
    }

    /**
     * Merge Object with another object
     * @param path
     * @param value
     * @param $return
     */
    public mergeWith(path: string, value: object, $return?: false): this {
        let $object = this.get(path, {});
        $object = _.merge($object, value);
        this.set(path, $object);
        return $return ? $object : this;
    }

    /**
     * Push to array in object
     * @param path
     * @param value
     */
    public push(path: string, value: any) {
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
    public addToObject(path: string, $object: { key: string, value: any }) {
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
    public all() {
        return this.data;
    }
}

export = ObjectCollection;
