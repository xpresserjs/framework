import ControllerServiceError = require("./ControllerServiceError");
import {XpresserHttp} from "../../types/http";
import {ControllerServiceObject} from "../../xpresser";

declare const _: any;

const $defaultController = {
    services: {},
};

interface XpresserControllerServices {
    [name: string]: (options: string, context?: {
        http?: XpresserHttp.Engine,
        services?: any,
        error?: (...args) => ControllerServiceError,
    }) => {};
}

class ControllerService {
    public controller: {
        __extend__?: {
            services?: object,
        },
    };

    constructor($controller: ControllerServiceObject | any) {
        if ($controller) {
            this.controller = $controller;
            this.controller.__extend__ = $defaultController;
        } else {
            throw Error("Service not defined!");
        }
    }

    public services($services: XpresserControllerServices): this {
        this.controller.__extend__.services = Object.assign(this.controller.__extend__.services || {}, $services);
        return this;
    }

    protected getClone(): any {
        return _.cloneDeep(this.controller);
    }

}

export = ControllerService;
