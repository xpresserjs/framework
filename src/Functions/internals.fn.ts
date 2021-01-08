import {getInstance} from "../../index";
import type {DollarSign} from "../../types";

import PathHelper = require("../Helpers/Path");
import path = require("path");

const $ = getInstance();

export function parseControllerString(controllerString: string) {
    const split = controllerString.split("@");
    let startIndex = 0;
    if (split.length > 2) startIndex = split.length - 2;
    const method = split[startIndex + 1];

    return {
        controller: controllerString.replace(`@${method}`, ''),
        method
    }
}

export function initializeTypescriptFn(filename: string, run?: (isNode: any) => void): DollarSign {

    if (!filename) throw Error(`isTypescript: requires __filename as argument.`);

    const isTypeScriptFile = filename.substr(-3) === '.ts';
    const tsBaseFolder = (() => {
        return path.resolve($.path.resolve(`base://../`))
    })();

    // Set Project extension
    if (isTypeScriptFile) {
        $.config.set('project.fileExtension', '.ts');

        // Change Default config file.
        if ($.config.get("paths.routesFile") === "backend://routes.js") {
            $.config.set('paths.routesFile', 'backend://routes.ts');
        }
    }

    // Check for presser engine
    if (!isTypeScriptFile && !$.file.exists(PathHelper.resolve($.config.get('paths.npm')))) {
        // $.logError('Path to xpresser engine files maybe missing, point {config.paths.npm} to your node_modules folder.')
        try {
            $.config.set('paths.npm', $.path.node_modules());
            $.path.engine('', false, true);
        } catch (e) {
            $.logError('Path to xpresser engine files maybe missing, point {config.paths.npm} to your node_modules folder.')
        }
    }


    if (!isTypeScriptFile) {
        /**
         * Fix route file.
         */
        const routesFile = $.config.get('paths.routesFile');
        if (routesFile.includes('.ts')) {
            $.config.set('paths.routesFile', routesFile.replace('.ts', '.js'))
        }

        /**
         * Fix jsonConfigs
         */
        let jsonConfigs: string = $.config.get('paths.jsonConfigs');
        jsonConfigs = $.path.resolve(jsonConfigs);
        jsonConfigs = jsonConfigs.replace($.path.base(), tsBaseFolder + '/');
        $.config.set('paths.jsonConfigs', jsonConfigs);


        /**
         * Fix views folder
         */
        let viewsPath: string = $.config.get('paths.views');
        viewsPath = $.path.resolve(viewsPath);
        const tsViewsPath = viewsPath.replace($.path.base(), tsBaseFolder + '/')

        if ($.file.exists(tsViewsPath) && !$.file.exists(viewsPath)) {
            $.config.set('paths.views', tsViewsPath);
        }
    }

    /**
     * If run is a function,  we pass `isNode` i.e `!isTypeScriptFile` to it.
     */
    if (typeof run === "function") {
        run(isTypeScriptFile ? false : {
            ts: {
                baseFolder: tsBaseFolder
            }
        });
    }

    return $;
}