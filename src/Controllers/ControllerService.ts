import type {Controller} from "../../types/http";
import lodash from "lodash";

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

    constructor($controller: Controller.Object | any) {
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
    public services($services: Controller.Services): this {
        // @ts-ignore
        this.controller.__extend__.services = Object.assign(this.controller.__extend__.services as object || {}, $services);
        return this;
    }

    /**
     * Clone current controller.
     */
    protected getClone(): any {
        return lodash.cloneDeep(this.controller);
    }

}

export = ControllerService;
