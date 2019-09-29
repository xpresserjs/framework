import {Xpresser} from "../../xpresser";

declare const $: Xpresser;

const loadOnEvents = (name: string, done: () => void) => {
    const key = `on.${name}`;
    const onEvents: any[] = $.on.events()[name];
    if (onEvents.length) {

        onEvents.push(done);

        $.engineData.set(key, 0);

        const next = async () => {
            const currentIndex = $.engineData.get(key, 0);
            const nextIndex = currentIndex + 1;
            $.engineData.set(key, nextIndex);

            return onEvents[nextIndex](next);
        };

        return onEvents[0](next);
    } else {
        return done();
    }
};

export = loadOnEvents;
