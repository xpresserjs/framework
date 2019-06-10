import Validator = require("object-validator-pro");

const ovp = new Validator();

declare let $: Xjs;

ovp.setEventHandler({
    onEachError: (param, msg) => {
        $.logError("Database: " + msg);
    },
});

// Set Validation Rules
ovp.addValidator("checkDbConfig", (connection) => {
    return ovp.validate(connection, {
        "*": {must: true},
        "password": {must: false},
    });
}, "Check connection config.");

export = ovp;
