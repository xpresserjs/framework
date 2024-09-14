import fs from "fs";
import lodash from "lodash";
import {getInstance} from "../../index";
import Handlebars from "handlebars";
import fse from "fs-extra";
import Pluralise from "pluralize";
import colors from "../Objects/consoleColors.obj";
import PathHelper from "../Helpers/Path";

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

    copyFromFactoryToApp(For: "job" | "event" | "controller" | "middleware" | "model" | string[], $name: string, $to: string, $data: Record<string, any> = {}, addPrefix = true) {
        let $factory;
        let $for: string


        if (Array.isArray(For)) [$for, $factory] = For;
        else $for = For;

        PathHelper.makeDirIfNotExist($to);

        if (!$name.toLowerCase().includes($for)) {
            if (addPrefix && $for !== "model") {
                $name = $name + lodash.upperFirst($for);
            }
        }

        // make last path upper case
        if ($for !== "job") {
            if ($name.includes('/')) {
                const names = $name.split('/');
                const lastPath = lodash.upperFirst(names.pop());
                names.push(lastPath);
                $name = names.join('/');
            } else {
                $name = lodash.upperFirst($name);
            }
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
