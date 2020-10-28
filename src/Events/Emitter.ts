// Imported Immediately after events are registered.
import events = require("events");
import {DollarSign} from "../../types";
import {StringToAnyKeyObject} from "../CustomTypes";

declare const $: DollarSign;

export = (DefinedEvents: StringToAnyKeyObject) => {
    const EventEmitter = new events.EventEmitter();

    EventEmitter.on("runEvent", async ($payload: {
        event: string,
        payload: any[],
        callback?: (eventResult: any) => any | void,
    }) => {
        if (DefinedEvents.hasOwnProperty($payload.event)) {
            let eventResult = undefined;
            try {
                eventResult = DefinedEvents[$payload.event](...$payload.payload);
            } catch (e) {
                $.logError(e);
            }

            if (typeof eventResult !== "undefined" && $payload["callback"]) {
                try {
                    await $payload.callback(eventResult);
                } catch (e) {
                    $.logError(e);
                }
            }
        }
    });

    class EventsEmitter {
        public static emit(event: string, ...args: any[]): void {
            EventEmitter.emit("runEvent", {
                event,
                payload: args,
            });
        }

        public static emitAfter(time: number = 3000, event: string, ...args: any[]): void {
            setTimeout(() => {
                EventsEmitter.emit(event, ...args);
            }, time);
        }

        public static emitWithCallback(event: string, args: any[], callback: (eventResult: any) => any) {
            EventEmitter.emit("runEvent", {
                event,
                payload: args,
                callback,
            });
        }
    }

    return EventsEmitter;
};
