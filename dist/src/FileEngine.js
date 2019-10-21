"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const fse = require("fs-extra");
$.file = {
    /**
     * Return Node fs instance
     * @return {fs}
     */
    fs() {
        return fs;
    },
    /**
     * Return Node fs-extra instance
     * @return {fse}
     */
    fsExtra() {
        return fse;
    },
    /**
     * Check file size.
     * @param $path
     */
    size($path) {
        try {
            return fs.statSync($path).size;
        }
        catch (e) {
            return 0;
        }
    },
    /**
     * IsFIle
     * @param $path
     */
    isFile($path) {
        try {
            return fs.statSync($path).isFile();
        }
        catch (e) {
            return false;
        }
    },
    /**
     * isSymbolicLink
     * @param $path
     */
    isSymbolicLink($path) {
        try {
            return fs.statSync($path).isSymbolicLink();
        }
        catch (e) {
            return false;
        }
    },
    /**
     * isDirectory
     * @param $path
     */
    isDirectory($path) {
        try {
            return fs.statSync($path).isDirectory();
        }
        catch (e) {
            return false;
        }
    },
    /**
     *
     * @param $path
     * @param $options
     */
    get($path, $options) {
        const fileExists = $.file.exists($path);
        if (!fileExists) {
            return false;
        }
        return fs.readFileSync($path, $options);
    },
    /**
     *
     * @param $path
     * @param $options
     */
    read($path, $options) {
        return $.file.get($path, $options);
    },
    /**
     * Read Directory
     * @param $path
     * @param $options
     */
    readDirectory($path, $options) {
        return this.getDirectory($path, $options);
    },
    /**
     * Get Directory
     * @param $path
     * @param $options
     */
    getDirectory($path, $options) {
        const fileExists = $.file.exists($path);
        if (!fileExists) {
            return false;
        }
        return fs.readdirSync($path, $options);
    },
    /**
     * Check if a path or an array of paths exists.
     *
     * if $returnList is true and $path is an array,
     * the list of files found will be returned.
     * @param {string|string[]} $path - Path or Paths to find.
     * @param {boolean} $returnList - Return list of found files in array.
     */
    exists($path, $returnList = false) {
        // If Array, loop and check if each files exists
        if (Array.isArray($path)) {
            const files = $path;
            // Holds files found
            const filesFound = [];
            for (const file of files) {
                const fileExists = $.file.exists(file);
                // If we are not returning lists then we should stop once a path is not found.
                if (!$returnList && !fileExists) {
                    return false;
                }
                if (fileExists) {
                    filesFound.push(file);
                }
            }
            return $returnList ? filesFound : true;
        }
        else {
            // to check data passed.
            try {
                return fs.existsSync($path);
            }
            catch (e) {
                return false;
            }
        }
    },
    delete($path, $returnList = false, $deleteDirectories = false) {
        // If Array, loop and check if each files exists
        if (Array.isArray($path)) {
            const paths = $path;
            // Holds files found
            const pathsDeleted = [];
            for (const path of paths) {
                const pathExists = $.file.delete(path);
                // If we are not returning lists then we should stop once a path is not found.
                if (!$returnList && !pathExists) {
                    return false;
                }
                if (pathExists) {
                    pathsDeleted.push(path);
                }
            }
            return $returnList ? pathsDeleted : true;
        }
        else {
            // to check data passed.
            try {
                if ($deleteDirectories && $.file.isDirectory($path)) {
                    fse.removeSync($path);
                }
                else {
                    fs.unlinkSync($path);
                }
                return true;
            }
            catch (e) {
                return false;
            }
        }
    },
};
