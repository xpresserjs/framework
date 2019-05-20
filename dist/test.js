"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const Xpresser = require("./index");
// console.log(path.resolve(__dirname, "../../domain-manager"));
const xpresser = Xpresser({
    database: {
        startOnBoot: false,
    },
    paths: {
        base: path_1.default.resolve(__dirname, "../../domain-manager"),
    },
});
//# sourceMappingURL=test.js.map