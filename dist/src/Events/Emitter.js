"use strict";
// Imported Immediately after events are registered.
const events = require("events");
const EventEmitter = new events.EventEmitter();
const DefinedEvents = $.engineData.get("DefinedEvents", {});
EventEmitter.on("runEvent", ($payload) => {
    if (DefinedEvents.hasOwnProperty($payload.event)) {
        DefinedEvents[$payload.event]($payload.payload);
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
}
module.exports = EventsEmitter;
