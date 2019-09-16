"use strict";
// Imported Immediately after events are registered.
const events = require("events");
const EventEmitter = new events.EventEmitter();
const DefinedEvents = $.engineData.get("DefinedEvents", {});
EventEmitter.on("runEvent", ($payload) => {
    if (DefinedEvents.hasOwnProperty($payload.event)) {
        let eventResult = undefined;
        try {
            eventResult = DefinedEvents[$payload.event](...$payload.payload);
        }
        catch (e) {
            $.logError(e);
        }
        if (typeof eventResult !== "undefined" && $payload.hasOwnProperty("callback")) {
            if ($.fn.isPromise(eventResult)) {
                eventResult
                    .then((result) => $payload.callback(result))
                    .catch((e) => $.logError(e));
            }
            else {
                try {
                    $payload.callback(eventResult);
                }
                catch (e) {
                    $.logError(e);
                }
            }
        }
    }
});
class EventsEmitter {
    static emit(event, ...args) {
        EventEmitter.emit("runEvent", {
            event,
            payload: args,
        });
    }
    static emitAfter(time = 3000, event, ...args) {
        setTimeout(() => {
            EventsEmitter.emit(event, ...args);
        }, time);
    }
    static emitWithCallback(event, args, callback) {
        EventEmitter.emit("runEvent", {
            event,
            payload: args,
            callback,
        });
    }
}
module.exports = EventsEmitter;
