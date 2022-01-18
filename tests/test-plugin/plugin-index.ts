import {DollarSign, PluginData} from "../../types";

export function dependsOn() {
    // return ["abolish"]
    return [];
}

export function run(plugin: PluginData, $: DollarSign) {
    $.logWarning(`Hello from plugin: ${plugin.namespace}`);
}