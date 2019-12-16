import {DollarSign} from "../../types";

declare const $: DollarSign;

const loadOnEvents = (name: string, done: () => void) => {
    const key = `on.${name}`;
    const onEvents: any[] = $.on.events()[name];
    // $.logAndExit(onEvents, done);
    if (onEvents.length) {

        onEvents.push(done);

        $.engineData.set(key, 0);

        const next = async () => {
            const currentIndex = $.engineData.get(key, 0);
            const nextIndex = currentIndex + 1;
            $.engineData.set(key, nextIndex);

            if (typeof onEvents[nextIndex] === "function") {
                return onEvents[nextIndex](next);
            }
        };

        return onEvents[0](next);
    } else {
        return done();
    }
};

export = loadOnEvents;
