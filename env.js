const fs = require("fs");
const dotEnv = require("dotenv");
const dotEnvExpand = require("dotenv-expand")

/**
 * Cast True/False to booleans.
 * @param env
 * @returns {*}
 */
const castBooleans = (env) => {
    const envKeys = Object.keys(env);
    for (let i = 0; i < envKeys.length; i++) {
        const envKey = envKeys[i];
        const envVal = env[envKey].toLowerCase();

        if (envVal === 'true') {
            env[envKey] = true;
        } else if (envVal === 'false') {
            env[envKey] = false;
        }
    }

    return env;
};

/**
 * Load .env file
 * @param path - path to .env file.
 * @param {{castBoolean: boolean, required: []}} config - env options.
 * @returns {*}
 */
module.exports = (path, config = {}) => {
    config = {
        castBoolean: true,
        required: [],
        ...config
    };


    if (!fs.existsSync(path)) {
        throw new Error(`Env file: {${path}} does not exists!`);
    }

    let isDir = false;
    if (fs.lstatSync(path).isDirectory()) {
        path = path + "/.env";
        isDir = true;
    }

    // Recheck env
    if (isDir && !fs.existsSync(path)) {
        throw new Error(`Env file: {${path}} does not exists!`);
    }

    /**
     * Get parsed env variables
     * @type {{}}
     */
    let env = dotEnvExpand(dotEnv.config({path})).parsed;


    if (config.castBoolean) env = castBooleans(env);

    /**
     * Check if required environment variables exists
     * else throw error.
     */
    const required = config.required;
    if (required && Array.isArray(required) && required.length) {

        const missing = [];
        for (const key of required) {
            if (!env.hasOwnProperty(key)) missing.push(key);
        }

        if (missing.length) {
            console.log(); // spacing
            console.error('The following ENV variables are REQUIRED but not found.');
            console.log(missing);
            console.log(); // spacing

            return process.exit(); // stop process
        }
    }

    return env;
};
