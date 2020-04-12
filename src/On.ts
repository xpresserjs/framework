/* On Applications Event Engine */
import {DollarSign} from "../types";

declare const $: DollarSign;

const OnEvents: {[key: string]: any[]} = {
    start: [],
    boot: [],
    expressInit: [],
    bootServer: [],
    http: [],
    https: [],
};

/**
 * AddToEvents - Short Hand Function
 * Adds an event to a given key.
 * @param name
 * @param todo
 * @constructor
 */
const AddToEvents = (name: any, todo: any) => {
    if (Array.isArray(todo)) {
        for (const key in todo) {
            if (todo.hasOwnProperty(key)) {
                $.on[name](todo[key]);
            }
        }
    } else {
        OnEvents[name].push(todo);
    }
};

// Initialise $.on
$.on = {
    events() {
        return OnEvents;
    },

    start(todo) {
        return AddToEvents("start", todo);
    },

    boot(todo) {
        return AddToEvents("boot", todo);
    },

    expressInit(todo) {
        return AddToEvents("expressInit", todo);
    },

    bootServer(todo) {
        return AddToEvents("bootServer", todo);
    },

    http(todo) {
        return AddToEvents("http", todo);
    },

    https(todo) {
        return AddToEvents("https", todo);
    },
};
