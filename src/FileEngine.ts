import fs = require("fs");
import fse = require("fs-extra");
import {DollarSign} from "../types";

declare const $: DollarSign;

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
    size($path: string): number {
        try {
            return fs.statSync($path).size;
        } catch (e) {
            return 0;
        }
    },

    /**
     * IsFIle
     * @param $path
     */
    isFile($path: string): boolean {
        try {
            return fs.statSync($path).isFile();
        } catch (e) {
            return false;
        }
    },

    /**
     * isSymbolicLink
     * @param $path
     */
    isSymbolicLink($path: string): boolean {
        try {
            return fs.statSync($path).isSymbolicLink();
        } catch (e) {
            return false;
        }
    },

    /**
     * isDirectory
     * @param $path
     */
    isDirectory($path: string): boolean {
        try {
            return fs.statSync($path).isDirectory();
        } catch (e) {
            return false;
        }
    },

    /**
     *
     * @param $path
     * @param $options
     */
    get($path: string, $options?: { encoding?: null, flag?: string } | null): string | Buffer | false {
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
    read($path: string, $options?: { encoding?: string, flag?: string }): string | Buffer | false {
        return $.file.get($path, $options);
    },

    /**
     * Read Directory
     * @param $path
     * @param $options
     */
    readDirectory($path: string, $options?: {
        encoding?: string,
        writeFileTypes?: string,
    }): string[] | Buffer[] | false {
        return this.getDirectory($path, $options);
    },

    /**
     * Get Directory
     * @param $path
     * @param $options
     */
    getDirectory($path: string, $options?: {
        encoding?: null,
        writeFileTypes?: string,
    }): string[] | Buffer[] | false {
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
    exists($path: string | string[], $returnList = false): boolean | string[] {
        // If Array, loop and check if each files exists
        if (Array.isArray($path)) {
            const files = $path as string[];
            // Holds files found
            const filesFound = [] as string[];

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
        } else {
            // to check data passed.
            try {
                return fs.existsSync($path);
            } catch (e) {
                return false;
            }
        }

    },

    delete($path: string | string[], $returnList = false, $deleteDirectories = false) {
        // If Array, loop and check if each files exists
        if (Array.isArray($path)) {
            const paths = $path as string[];
            // Holds files found
            const pathsDeleted = [] as string[];

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
        } else {
            // to check data passed.
            try {
                if ($deleteDirectories && $.file.isDirectory($path)) {
                    fse.removeSync($path);
                } else {
                    fs.unlinkSync($path);
                }
                return true;
            } catch (e) {
                return false;
            }
        }
    },

    readJson($path: string) {
        /**
         * Check if path exists
         */
        if (!fs.existsSync($path)) {
            throw Error(`RequireJson: Path (${$path}) does not exists.`);
        }

        try {
            const file = fs.readFileSync($path).toString();
            return JSON.parse(file);
        } catch (e) {
            throw Error(`RequireJson: Error parsing json file (${$path})`);
        }
    },

    saveToJson($path: string, $content: any, $options = {}) {
        $options = Object.assign({
            checkIfFileExists: true,
            replacer: null,
            space: 2
        }, $options)
        /**
         * Check if path exists
         */
        if ($options.checkIfFileExists && !fs.existsSync($path)) {
            throw Error(`SaveToJson: Path (${$path}) does not exists.`);
        }

        try {
            fs.writeFileSync($path, JSON.stringify($content, $options.replacer, $options.space))
            return true;
        } catch (e) {
            throw Error(`RequireJson: Error saving data to json file (${$path})`);
        }
    }
};
