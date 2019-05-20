import path from "path";
import Xpresser = require("./index");

const base = path.resolve(__dirname, "../../xjs");

// console.log(path.resolve(__dirname, "../../domain-manager"));
const xpresser = Xpresser(base + "/config.js");
