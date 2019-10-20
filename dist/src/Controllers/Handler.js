"use strict";
const $defaultHandler = {
    tasks: {},
};
class Handler {
    constructor($handler) {
        if ($handler) {
            this.handler = $handler;
            this.handler.__extend__ = $defaultHandler;
        }
        else {
            throw Error("Handler not defined!");
        }
    }
    cloneHandler() {
        return _.clone(this.handler);
    }
    tasks($tasks) {
        this.handler.__extend__.tasks = Object.assign(this.handler.__extend__.tasks || {}, $tasks);
        return this;
    }
}
module.exports = Handler;
