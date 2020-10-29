import {DollarSign} from "../../types";
import PathHelper from "../Helpers/Path";

declare const $: DollarSign;

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

export function initializeTypescriptFn(filename: string, run?: (isNode: boolean) => void): DollarSign {

    if (!filename) throw Error(`isTypescript: requires __filename as argument.`);

    const isTypeScriptFile = filename.substr(-3) === '.ts';

    // Set Project extension
    if (isTypeScriptFile) {
        $.config.set('project.fileExtension', '.ts');
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
        const routesFile = $.config.get('paths.routesFile');
        if (routesFile.includes('.ts')) {
            $.config.set('paths.routesFile', routesFile.replace('.ts', '.js'))
        }
    }

    /**
     * If run is a function,  we pass `isNode` i.e `!isTypeScriptFile` to it.
     */
    if (typeof run === "function") {
        run(!isTypeScriptFile);
    }

    return $;
}