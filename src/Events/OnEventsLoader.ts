import {Xpresser} from "../../global";
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

            onEvents[nextIndex](next);
        };

        onEvents[0](next);
    } else {
        done();
    }
};

export = loadOnEvents;
