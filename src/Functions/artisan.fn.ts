import fs = require("fs");
import fse = require("fs-extra");
import Handlebars = require("handlebars");
import Pluralise = require("pluralize");
import colors = require("../Objects/consoleColors.obj");

import PathHelper = require("../Helpers/Path");
import {Xpresser} from "../../global";

declare let $: Xpresser;
declare let _: any;

const isTinker = typeof $.$options.isTinker === "boolean" && $.$options.isTinker;
const FILE_EXTENSION = $.$config.get("project.fileExtension", ".js");

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
            PathHelper.makeDirIfNotExist($to);
        }

        if (!$name.toLowerCase().includes($for)) {
            if (addPrefix && $for !== "model") {
                $name = $name + _.upperFirst($for);
            }
        }

        $to = $to + "/" + $name + FILE_EXTENSION;

        if (fs.existsSync($to)) {
            return this.logThisAndExit($name + " already exists!");
        }

        PathHelper.makeDirIfNotExist($to, true);

        const $from = $.path.engine("Factory/" + $for + ".hbs");
        $data = _.extend({}, {name: $name}, $data);
        fs.writeFileSync($to, this.factory($from, $data));

        this.logThis($name + " created successfully.");
        this.logThis("located @ " + $to);
    },

    copyFolder($from, $to) {
        fse.copySync($from, $to);
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
