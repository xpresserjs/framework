"use strict";
const RequestEngine = require("../RequestEngine");
const ObjectCollection = require("object-collection");
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
}
else {
    const $pluginNamespaceKeys = Object.keys(PluginNameSpaces);
    for (let k = 0; k < $pluginNamespaceKeys.length; k++) {
        const $pluginNamespaceKey = $pluginNamespaceKeys[k];
        const $plugin = new ObjectCollection(PluginNameSpaces[$pluginNamespaceKey]);
        if ($plugin.has("extends.RequestEngine")) {
            const $requestEngineExtender = $plugin.get("extends.RequestEngine");
            try {
                const $requestEngine = require($requestEngineExtender);
                ExtendRequestEngineUsing($requestEngine);
            }
            catch (e) {
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
module.exports = ExtendedRequestEngine;
//# sourceMappingURL=ExtendedRequestEngine.js.map