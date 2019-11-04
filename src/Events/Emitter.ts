// Imported Immediately after events are registered.
import events = require("events");
import {DollarSign} from "../../xpresser";
declare const $: DollarSign;

export = (DefinedEvents: object) => {
    const EventEmitter = new events.EventEmitter();

    EventEmitter.on("runEvent", ($payload: {
        event: string,
        payload: any[],
        callback?: (eventResult: any) => any,
    }) => {
        if (DefinedEvents.hasOwnProperty($payload.event)) {

            let eventResult = undefined;
            try {
                eventResult = DefinedEvents[$payload.event](...$payload.payload);
            } catch (e) {
                $.logError(e);
            }

            if (typeof eventResult !== "undefined" && $payload.hasOwnProperty("callback")) {
                if ($.fn.isPromise(eventResult)) {
                    eventResult
                        .then((result) => $payload.callback(result))
                        .catch((e) => $.logError(e));
                } else {
                    try {
                        $payload.callback(eventResult);
                    } catch (e) {
                        $.logError(e);
                    }
                }
            }
        }
    });

    class EventsEmitter {
        public static emit(event: string, ...args): void {
            EventEmitter.emit("runEvent", {
                event,
                payload: args,
            });
        }

        public static emitAfter(time: number = 3000, event: string, ...args): void {
            setTimeout(() => {
                EventsEmitter.emit(event, ...args);
            }, time);
        }

        public static emitWithCallback(event: string, args: any[], callback: (eventResult) => any) {
            EventEmitter.emit("runEvent", {
                event,
                payload: args,
                callback,
            });
        }
    }

    return EventsEmitter;
};
