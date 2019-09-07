import {Xpresser} from "../global";

declare let $: Xpresser;

if ($.config.console.startOnBoot) {
    $.startConsole();
}
