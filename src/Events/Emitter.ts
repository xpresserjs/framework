import events from "events";
import {getInstance} from "../../index";

const $ = getInstance();

export = (DefinedEvents: Record<string, any>) => {

    const EventEmitter = new events.EventEmitter();

    EventEmitter.on("runEvent", async ($payload: {
        event: string,
        payload: any[],
        callback?: (eventResult: any) => any | void,
    }) => {
        if (DefinedEvents.hasOwnProperty($payload.event)) {

            try {
                if ($payload.callback) {
                    let eventResult: any;

                    if ($payload.payload) {
                        eventResult = await DefinedEvents[$payload.event](...$payload.payload);
                    } else {
                        eventResult = await DefinedEvents[$payload.event]();
                    }

                    $payload.callback(eventResult);
                } else {

                    if ($payload.payload) {
                        DefinedEvents[$payload.event](...$payload.payload);
                    } else {
                        DefinedEvents[$payload.event]();
                    }

                }
            } catch (e) {
                $.logError(e);
            }
        }
    });

    return class XpresserEventsEmitter {
        public static emit(event: string, ...args: any[]): void {
            EventEmitter.emit("runEvent", {
                event,
                payload: args,
            });
        }

        public static emitAfter(time: number = 3000, event: string, ...args: any[]): void {
            setTimeout(() => {
                XpresserEventsEmitter.emit(event, ...args);
            }, time);
        }

        public static emitWithCallback(event: string, args: any[], callback: (eventResult: any) => any) {
            EventEmitter.emit("runEvent", {
                event,
                payload: args,
                callback,
            });
        }

        public static define(event: string, run: (...args: any[]) => void | any): void {
            DefinedEvents[event] = run;
        }
    }
};
