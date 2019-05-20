import path from "path";
import Xpresser = require("./index");

// console.log(path.resolve(__dirname, "../../domain-manager"));
const xpresser = Xpresser({
    database: {
        startOnBoot: false,
    },
    paths: {
        base: path.resolve(__dirname, "../../domain-manager"),
    },
});
