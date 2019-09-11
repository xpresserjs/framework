"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// ---------- IF Helpers ----------
$.ifConsole = (isConsole, notConsole) => {
    if ($.options.isConsole) {
        isConsole();
    }
    else {
        notConsole();
    }
};
$.ifIsConsole = (isConsole) => {
    if ($.options.isConsole) {
        isConsole();
    }
};
$.ifNotConsole = (notConsole) => {
    if (!$.options.isConsole) {
        notConsole();
    }
};
