import RequestEngine = require("../RequestEngine");
import {DollarSign} from "../../types";
import PathHelper = require("../Helpers/Path");
import ObjectCollection = require("object-collection");

declare const $: DollarSign;

let ExtendedRequestEngine = RequestEngine;
const PluginNameSpaces = $.engineData.get("PluginEngine:namespaces", {});
const useDotJson: ObjectCollection = $.engineData.get("UseDotJson");

/**
 * Extend RequestEngine
 */
const ExtendRequestEngineUsing = ($extender: ($class: any) => any) => {
    if (typeof $extender === "function") {
        ExtendedRequestEngine = $extender(ExtendedRequestEngine);
    }
};

const RequireOrFail = ($RequestEngine: any, $plugin?: any) => {
    try {
        $RequestEngine = PathHelper.resolve($RequestEngine);
        ExtendRequestEngineUsing(require($RequestEngine));
    } catch (e) {
        $.logPerLine([
            $plugin === undefined ? {} : {error: `Error in plugin: ${$plugin}`},
            {error: e.stack},
            {errorAndExit: ""},
        ]);
    }
};

if ($.engineData.has("ExtendedRequestEngine")) {
    ExtendedRequestEngine = $.engineData.get("ExtendedRequestEngine");
} else {
    const $pluginNamespaceKeys = Object.keys(PluginNameSpaces);

    for (let k = 0; k < $pluginNamespaceKeys.length; k++) {
        const $pluginNamespaceKey = $pluginNamespaceKeys[k];
        const $plugin = $.objectCollection(PluginNameSpaces[$pluginNamespaceKey]);

        if ($plugin.has("extends.RequestEngine")) {
            const $requestEngineExtender = $plugin.get("extends.RequestEngine");
            RequireOrFail($requestEngineExtender, $pluginNamespaceKey);
        }
    }

    const $userRequestExtension = useDotJson.get("extends.RequestEngine", false);
    if ($userRequestExtension) {
        if (Array.isArray($userRequestExtension)) {
            for (const extension of $userRequestExtension) {
                RequireOrFail(extension);
            }
        } else {
            RequireOrFail($userRequestExtension);
        }
    }
}

export = ExtendedRequestEngine;
