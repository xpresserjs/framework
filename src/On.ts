/* On Applications Event Engine */
import {Xpresser} from "../global";

declare const $: Xpresser;

const OnEvents = {
    boot: [],
    startHttp: [],
};

$.on = {
    events() {
        return OnEvents;
    },

    boot(todo) {
        if (Array.isArray(todo)) {
            // tslint:disable-next-line:forin
            for (const key in todo) {
                this.boot(todo[key]);
            }
        } else {
            OnEvents.boot.push(todo);
        }
    },

    startHttp(todo) {
        if (Array.isArray(todo)) {
            // tslint:disable-next-line:forin
            for (const key in todo) {
                this.startHttp(todo[key]);
            }
        } else {
            OnEvents.startHttp.push(todo);
        }
    },
};
