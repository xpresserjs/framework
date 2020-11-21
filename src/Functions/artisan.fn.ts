import fs = require("fs");
import fse = require("fs-extra");
import Handlebars = require("handlebars");
import Pluralise = require("pluralize");
import colors = require("../Objects/consoleColors.obj");
import lodash from "lodash";
import PathHelper = require("../Helpers/Path");
import {getInstance} from "../../index";

const $ = getInstance();

const isTinker = typeof $.options.isTinker === "boolean" && $.options.isTinker;
const FILE_EXTENSION = $.config.get("project.fileExtension", ".js");

/**
 * Get the string after the last forward slash.
 * @param str
 */
const afterLastSlash = (str: string) => {
    if (str.includes("/")) {
        const parts = str.split("/");
        return lodash.upperFirst(parts[parts.length - 1]);
    }

    return lodash.upperFirst(str);
};

export = {
    logThis(...args: any[]) {
        if (isTinker) {
            args.unshift(colors.fgMagenta);
        } else {
            args.unshift(colors.fgCyan);
        }

        args.push(colors.reset);

        return $.log(...args);
    },

    logThisAndExit(...args: any[]) {
        if (isTinker) {
            return this.logThis(...args);
        } else {
            this.logThis(...args);
            $.logAndExit();
        }
    },


    factory(file: string, $data = {}) {

        /**
         * If app is Typescript then check if `.ts.hbs` of same file exists.
         */
        if ($.isTypescript()) {
            const tsFile = file.replace('.hbs', '.ts.hbs');
            if (fs.existsSync(tsFile)) {
                file = tsFile;
            }
        }

        const source = fs.readFileSync(file).toString();
        const template = Handlebars.compile(source);
        return template($data);
    },

    copyFromFactoryToApp($for: string | string[], $name: string, $to: string, $data: Record<string, any> = {}, addPrefix = true) {
        let $factory;

        if (Array.isArray($for)) {
            $factory = $for[1] as string;
            $for = $for[0];
        }

        if (!fs.existsSync($to)) {
            PathHelper.makeDirIfNotExist($to);
        }

        if (!$name.toLowerCase().includes($for)) {
            if (addPrefix && $for !== "model") {
                $name = $name + lodash.upperFirst($for);
            }
        }

        if ($name.includes('/')) {
            const names = $name.split('/');
            const lastPath = lodash.upperFirst(names.pop());
            names.push(lastPath);
            $name = names.join('/');
        } else {
            $name = lodash.upperFirst($name);
        }

        $to = $to + "/" + $name + FILE_EXTENSION;

        if (fs.existsSync($to)) {
            return this.logThisAndExit($name + " already exists!");
        }

        PathHelper.makeDirIfNotExist($to, true);

        /**
         * Get factory file from config or use default
         */
        const factoryName: string = $factory ? $factory : $for;
        let $from = $.path.engine("Factory/" + factoryName + ".hbs");

        let customFactoryFile: string = $.config.get(`artisan.factory.${factoryName}`);

        if (customFactoryFile) {
            if (!customFactoryFile.includes('.hbs')) {
                return this.logThisAndExit(`Custom factory file defined for ${factoryName} is not a (.hbs) file`)
            }

            customFactoryFile = PathHelper.resolve(customFactoryFile);

            if (!$.file.exists(customFactoryFile)) {
                return this.logThisAndExit(`Custom factory file defined for ${factoryName} does not exist.`)
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

    copyFolder($from: string, $to: string) {
        fse.copySync($from, $to);
        $.logAndExit("Views folder published successful.");
    },

    pluralize(str = ""): string {
        if (!str.trim().length) {
            return str;
        }

        return Pluralise(str);
    },

    singular(str: string) {
        return Pluralise.singular(str);
    },
};
