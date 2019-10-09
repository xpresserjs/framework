"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const loadOnEvents = (name, done) => {
    const key = `on.${name}`;
    const onEvents = $.on.events()[name];
    // $.logAndExit(onEvents, done);
    if (onEvents.length) {
        onEvents.push(done);
        $.engineData.set(key, 0);
        const next = () => __awaiter(void 0, void 0, void 0, function* () {
            const currentIndex = $.engineData.get(key, 0);
            const nextIndex = currentIndex + 1;
            $.engineData.set(key, nextIndex);
            if (typeof onEvents[nextIndex] === "function") {
                return onEvents[nextIndex](next);
            }
        });
        return onEvents[0](next);
    }
    else {
        return done();
    }
};
module.exports = loadOnEvents;
