"use strict";
const fs = require("fs");
const fse = require("fs-extra");
const Handlebars = require("handlebars");
const Pluralise = require("pluralize");
const colors = require("../Objects/consoleColors.obj");
const PathHelper = require("../Helpers/Path");
const isTinker = typeof $.options.isTinker === "boolean" && $.options.isTinker;
const FILE_EXTENSION = $.$config.get("project.fileExtension", ".js");
/**
 * Get the string after the last forward slash.
 * @param str
 */
const afterLastSlash = (str) => {
    if (typeof str === "string" && str.includes("/")) {
        const parts = str.split("/");
        return _.upperFirst(parts[parts.length - 1]);
    }
    return _.upperFirst(str);
};
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
    factory(file, $data = {}) {
        const source = fs.readFileSync(file).toString();
        const template = Handlebars.compile(source);
        return template($data);
    },
    copyFromFactoryToApp($for, $name, $to, $data = {}, addPrefix = true) {
        let $factory;
        if (Array.isArray($for)) {
            $factory = $for[1];
            $for = $for[0];
        }
        if (!fs.existsSync($to)) {
            PathHelper.makeDirIfNotExist($to);
        }
        if (!$name.toLowerCase().includes($for)) {
            if (addPrefix && $for !== "model") {
                $name = $name + _.upperFirst($for);
            }
        }
        if ($name.includes('/')) {
            const names = $name.split('/');
            const lastPath = _.upperFirst(names.pop());
            names.push(lastPath);
            $name = names.join('/');
        }
        else {
            $name = _.upperFirst($name);
        }
        $to = $to + "/" + $name + FILE_EXTENSION;
        if (fs.existsSync($to)) {
            return this.logThisAndExit($name + " already exists!");
        }
        PathHelper.makeDirIfNotExist($to, true);
        /**
         * Get factory file from config or use default
         */
        const factoryName = $factory || $for;
        let $from = $.path.engine("Factory/" + factoryName + ".hbs");
        let customFactoryFile = $.$config.get(`artisan.factory.${factoryName}`);
        if (customFactoryFile) {
            if (!customFactoryFile.includes('.hbs')) {
                return this.logThisAndExit(`Custom factory file defined for ${factoryName} is not a (.hbs) file`);
            }
            customFactoryFile = PathHelper.resolve(customFactoryFile);
            if (!$.file.exists(customFactoryFile)) {
                return this.logThisAndExit(`Custom factory file defined for ${factoryName} does not exist.`);
            }
            $from = customFactoryFile;
        }
        /**
         * Append needed data
         */
        $data['name'] = afterLastSlash($name);
        fs.writeFileSync($to, this.factory($from, $data));
        this.logThis($name + " created successfully.");
        this.logThis("located @ " + $to.replace($.path.base(), ""));
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
