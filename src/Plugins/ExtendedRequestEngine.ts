import RequestEngine = require("../RequestEngine");
import {Xpresser, ObjectCollection} from "../../xpresser";
import PathHelper = require("../Helpers/Path");

declare let $: Xpresser;

let ExtendedRequestEngine = RequestEngine;
const PluginNameSpaces = $.engineData.get("PluginEngine:namespaces", {});
const useDotJson: ObjectCollection = $.engineData.get("UseDotJson");

const RequireOrFail = ($RequestEngine) => {
    try {
        $RequestEngine = PathHelper.resolve($RequestEngine);
        const $requestEngine = require($RequestEngine);
        ExtendRequestEngineUsing($requestEngine);
    } catch (e) {
        $.logPerLine([
            {error: e.message},
            {errorAndExit: ""},
        ]);
    }
};

/**
 * Extend RequestEngine
 */
const ExtendRequestEngineUsing = ($extender) => {
    if (typeof $extender === "function") {
        ExtendedRequestEngine = $extender(RequestEngine);
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
            RequireOrFail($requestEngineExtender);
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
