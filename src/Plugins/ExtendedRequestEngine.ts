import RequestEngine = require("../RequestEngine");
import {getInstance} from "../../index";
import PathHelper = require("../Helpers/Path");
import type ObjectCollection = require("object-collection");


const $ = getInstance();

let ExtendedRequestEngine = RequestEngine;

// Set Request Engine Getter
$.engineData.set("ExtendedRequestEngine", () => ExtendedRequestEngine);

// Set extended request engine getter.
$.extendedRequestEngine = () => {
    return $.engineData.get("ExtendedRequestEngine")();
}

const PluginNameSpaces: Record<string, any> = $.engineData.get("PluginEngine:namespaces", {});
const useDotJson: ObjectCollection = $.engineData.get("UseDotJson");

/**
 * Extend RequestEngine
 */
const ExtendRequestEngineUsing = (extender: ($class: any) => any) => {
    if (typeof extender === "function") {
        /**
         * Since we can't differentiate between a class and a function
         * we need to check if the extender has a static function called `expressify`
         * which exists on the default RequestEngine.
         */
        if (typeof (extender as unknown as typeof RequestEngine).expressify === "function") {
            ExtendedRequestEngine = extender as unknown as typeof RequestEngine;
        } else {
            /**
             * The case of Extenders returning a function that returns a class
             * Maybe deprecated in future since the introduction of $.extendedRequestEngine()
             */
            ExtendedRequestEngine = extender(ExtendedRequestEngine);
        }
    } else {
        throw new Error("Custom RequestEngine extender must be a function or an extended RequestEngine class.");
    }
};

const RequireOrFail = ($RequestEngine: any, plugin?: any) => {
    try {
        $RequestEngine = PathHelper.resolve($RequestEngine);
        ExtendRequestEngineUsing(require($RequestEngine));
    } catch (e) {
        $.logPerLine([
            plugin === undefined ? {} : {error: `Error in plugin: ${plugin}`},
            {error: (e as Error).stack},
            {errorAndExit: ""},
        ]);
    }
};

/**
 * Load Plugin Request Engines
 */
const pluginNamespaceKeys = Object.keys(PluginNameSpaces);

for (let k = 0; k < pluginNamespaceKeys.length; k++) {
    const pluginNamespaceKey = pluginNamespaceKeys[k];
    const plugin = $.objectCollection(PluginNameSpaces[pluginNamespaceKey]);

    if (plugin.has("extends.RequestEngine")) {
        const requestEngineExtender = plugin.get("extends.RequestEngine");
        RequireOrFail(requestEngineExtender, pluginNamespaceKey);
    }
}

/**
 * Load User defined request Engine
 */
const userRequestExtension = useDotJson.get<boolean | any[]>("extends.RequestEngine", false);
if (userRequestExtension) {
    if (Array.isArray(userRequestExtension)) {
        for (const extension of userRequestExtension) {
            RequireOrFail(extension);
        }
    } else {
        RequireOrFail(userRequestExtension);
    }
}

export = ExtendedRequestEngine;
