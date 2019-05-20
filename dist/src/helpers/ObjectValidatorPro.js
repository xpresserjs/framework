"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const object_validator_pro_1 = __importDefault(require("object-validator-pro"));
const ovp = new object_validator_pro_1.default();
ovp.setEventHandler({
    onEachError: (param, msg) => {
        $.logError("Database: " + msg);
    },
});
// Set Validation Rules
ovp.addValidator("checkDbConfig", (connection) => {
    return ovp.validate(connection, {
        "*": { must: true },
        "password": { must: false },
    });
}, "Check connection config in knexFile.js");
module.exports = ovp;
//# sourceMappingURL=ObjectValidatorPro.js.map