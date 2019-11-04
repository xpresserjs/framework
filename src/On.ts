/* On Applications Event Engine */
import {DollarSign} from "../xpresser";

declare const $: DollarSign;

const OnEvents = {
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
const AddToEvents = (name, todo) => {
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
