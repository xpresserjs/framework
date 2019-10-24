"use strict";
const $defaultController = {
    services: {},
};
class ControllerService {
    constructor($controller) {
        if ($controller) {
            this.controller = $controller;
            this.controller.__extend__ = $defaultController;
        }
        else {
            throw Error("Service not defined!");
        }
    }
    services($services) {
        this.controller.__extend__.services = Object.assign(this.controller.__extend__.services || {}, $services);
        return this;
    }
    getClone() {
        return _.cloneDeep(this.controller);
    }
}
module.exports = ControllerService;
