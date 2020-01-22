const fs = require("fs");
const dotenv = require("dotenv");

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
 * @param config - env options.
 * @returns {*}
 */
module.exports = (path, config = {
    castBoolean: true,
    required: [],
}) => {

    if (!fs.existsSync(path)) {
        throw new Error(`Env file: {${path}} does not exists!`);
    }

    if (fs.lstatSync(path).isDirectory()) {
        path = path + "/.env";
    }

    /**
     * Get parsed env variables
     * @type {{}}
     */
    let env = dotenv.config({path}).parsed;

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
