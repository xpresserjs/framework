import Validator = require("object-validator-pro");
import {DollarSign} from "../../xpresser";

const ovp = new Validator();

declare let $: DollarSign;

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
