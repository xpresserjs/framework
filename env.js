const fs = require('fs');
const dotenv = require("dotenv");

/**
 * Cast True/False to booleans
 * @param env
 * @returns {*}
 */
const castBooleans = (env) => {
    const envKeys = Object.keys(env);
    for (let i = 0; i < envKeys.length; i++) {
        const envKey = envKeys[i];
        const envVal = env[envKey];

        if (envVal === 'true') {
            env[envKey] = true;
        } else if (envVal === 'false') {
            env[envKey] = false;
        }
    }

    return env;
};

/**
 *
 * @param path
 * @param config
 * @returns {*}
 */
module.exports = (path, config = {
    castBoolean: true
}) => {

    if (!fs.existsSync(path)) {
        throw new Error(`Env file: {${path}} does not exists!`);
    }

    if (fs.lstatSync(path).isDirectory()) {
        path = path + "/.env";
    }

    const env = dotenv.config({path}).parsed;

    if (config.castBoolean) castBooleans(env);

    return env;
};
