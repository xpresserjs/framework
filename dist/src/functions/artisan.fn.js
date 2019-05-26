"use strict";
const fs = require("fs-extra");
const Path = require("path");
const Handlebars = require("handlebars");
const Pluralise = require("pluralize");
const colors = require("../objects/consoleColors.obj");
const isTinker = typeof $.$options.isTinker === "boolean" && $.$options.isTinker;
module.exports = {
    logThis(...args) {
        if (isTinker) {
            args.unshift(colors.fgMagenta);
        }
        else {
            args.unshift(colors.fgCyan);
        }
        args.push(colors.reset);
        return $.log(...args);
    },
    logThisAndExit(...args) {
        if (isTinker) {
            return this.logThis(...args);
        }
        else {
            this.logThis(...args);
            $.logAndExit();
        }
    },
    factory($file, $data = {}) {
        const source = fs.readFileSync($file).toString();
        const template = Handlebars.compile(source);
        return template($data);
    },
    copyFromFactoryToApp($for, $name, $to, $data = {}, addPrefix = true) {
        $name = _.upperFirst($name);
        if (!fs.existsSync($to)) {
            fs.mkdirSync($to, { recursive: true });
        }
        if (!$name.toLowerCase().includes($for)) {
            if (addPrefix && $for !== "model") {
                $name = $name + _.upperFirst($for);
            }
        }
        $to = $to + "/" + $name + ".js";
        if (fs.existsSync($to)) {
            return this.logThisAndExit($name + " already exists!");
        }
        const thisPath = Path.dirname($to);
        if (!fs.existsSync(thisPath)) {
            fs.mkdirpSync(thisPath);
        }
        const $from = $.path.engine("factory/" + $for + ".hbs");
        $data = _.extend({}, { name: $name }, $data);
        fs.writeFileSync($to, this.factory($from, $data));
        this.logThis($name + " created successfully.");
        this.logThis("located @ " + $to);
    },
    copyFolder($from, $to) {
        fs.copySync($from, $to);
        $.logAndExit("Views folder published successful.");
    },
    pluralize(str = "") {
        if (!str.trim().length) {
            return Pluralise;
        }
        return Pluralise(str);
    },
    singular(str) {
        return Pluralise.singular(str);
    },
};
//# sourceMappingURL=artisan.fn.js.map