import RequestEngine = require("../RequestEngine");
import {Xjs} from "../../global";
import ObjectCollection = require("../Helpers/ObjectCollection");

declare let $: Xjs;

let ExtendedRequestEngine = RequestEngine;
const PluginNameSpaces = $.engineData.get("PluginEngine:namespaces", {});

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
        const $plugin = new ObjectCollection(PluginNameSpaces[$pluginNamespaceKey]);

        if ($plugin.has("extends.RequestEngine")) {
            const $requestEngineExtender = $plugin.get("extends.RequestEngine");
            try {
                const $requestEngine = require($requestEngineExtender);
                ExtendRequestEngineUsing($requestEngine);
            } catch (e) {
                $.logPerLine([
                    {
                        error: e.message,
                        errorAndExit: "",
                    },
                ]);
            }
        }
    }
}

export = ExtendedRequestEngine;
