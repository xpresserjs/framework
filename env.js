const fs = require('fs');
const dotenv = require("dotenv");

/**
 * @param {string} path
 * @returns {*}
 */
module.exports = (path) => {

    if (!fs.existsSync(path)) {
        throw new Error(`Env file: {${path}} does not exists!`);
    }

    if (fs.lstatSync(path).isDirectory()) {
        path = path + "/.env";
    }

    return dotenv.config({path}).parsed;
};
