import {XpresserController} from "../../types/http";

declare const _: any;

const $defaultController = {
    services: {},
};


class ControllerService {
    public controller: {
        [name: string]: any,
        __extend__?: {
            services?: object,
        },
    };

    constructor($controller: XpresserController.ControllerObject | any) {
        if ($controller) {
            this.controller = $controller;
            this.controller.__extend__ = $defaultController;
        } else {
            throw Error("Service not defined!");
        }
    }

    /**
     * Register controller services.
     * @param $services - object of services.
     */
    public services($services: XpresserController.Services): this {
        this.controller.__extend__.services = Object.assign(this.controller.__extend__.services || {}, $services);
        return this;
    }

    /**
     * Clone current controller.
     */
    protected getClone(): any {
        return _.cloneDeep(this.controller);
    }

}

export = ControllerService;
