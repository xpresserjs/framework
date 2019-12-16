import {DollarSign} from "../../index";

declare const $: DollarSign;

// ---------- IF Helpers ----------
$.ifConsole = (isConsole: () => void, notConsole: () => void): void => {
    if ($.options.isConsole) {
        isConsole();
    } else {
        notConsole();
    }
};

$.ifIsConsole = (isConsole: () => void): void => {
    if ($.options.isConsole) {
        isConsole();
    }
};

$.ifNotConsole = (notConsole: () => void): void => {
    if (!$.options.isConsole) {
        notConsole();
    }
};
