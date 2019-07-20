// Imported Immediately after events are registered.
import events = require("events");
import {Xpresser} from "../../global";

const EventEmitter = new events.EventEmitter();

declare const $: Xpresser;
const DefinedEvents = $.engineData.get("DefinedEvents", {});

EventEmitter.on("runEvent", ($payload: {
    event: string,
    payload: any[],
}) => {
    if (DefinedEvents.hasOwnProperty($payload.event)) {
        DefinedEvents[$payload.event]($payload.payload);
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
}

export = EventsEmitter;
