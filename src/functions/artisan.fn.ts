import fs = require("fs-extra");
import Path = require("path");
import Handlebars = require("handlebars");
import Pluralise = require("pluralize");
import colors = require("../objects/consoleColors.obj");
import {Xjs} from "../../global";

declare let $: Xjs;
declare let _: any;

const isTinker = typeof $.$options.isTinker === "boolean" && $.$options.isTinker;

export = {
    logThis(...args) {
        if (isTinker) {
            args.unshift(colors.fgMagenta);
        } else {
            args.unshift(colors.fgCyan);
        }

        args.push(colors.reset);

        return $.log(...args);
    },

    logThisAndExit(...args) {
        if (isTinker) {
            return this.logThis(...args);
        } else {
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
            fs.mkdirSync($to, {recursive: true});
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
        if (!fs.existsSync(thisPath)) { fs.mkdirpSync(thisPath); }

        const $from = $.path.engine("factory/" + $for + ".hbs");
        $data = _.extend({}, {name: $name}, $data);
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