import {getInstance, InXpresserError} from "../../index";

/**
 * Get on events loader
 * @param name
 * @param done
 */
export const runBootEvent = (name: string, done?: () => void) => {
    const $ = getInstance();

    const key = `on.${name}`;
    const onEvents: any[] = $.on.events()[name];

    if (onEvents.length) {
        onEvents.push(done);
        $.engineData.set(key, 0);

        const next = () => {
            const currentIndex = $.engineData.get(key, 0);
            const nextIndex = currentIndex + 1;
            $.engineData.set(key, nextIndex);

            if (typeof onEvents[nextIndex] === "function") {
                return InXpresserError.tryOrCatch(() => onEvents[nextIndex](next, $));
            }
        };

        // Pass next and current xpresser instance
        return InXpresserError.tryOrCatch(() => onEvents[0](next, $));
    } else {
        return done ? done() : false;
    }
};
