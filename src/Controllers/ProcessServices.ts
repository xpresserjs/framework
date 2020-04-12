import ControllerServiceError = require("./ControllerServiceError");

// Import Types
import {DollarSign} from "../../types";
import {Http} from "../../types/http";
import {ServerResponse} from "http";
import {StringToAnyKeyObject} from "../CustomTypes";

declare const $: DollarSign;

export = async (
    x: Http.Request,
    boot: any,
    requestServices: any,
    config: {
        services?: object,
    },
    error: (...args: any[]) => any,
) => {
    const DefinedServices: StringToAnyKeyObject = config.services || {};
    const completedServices: StringToAnyKeyObject = {};
    const serviceKeys = Object.keys(requestServices);

    for (const serviceKey of serviceKeys) {
        const options = {
            boot,
            http: x,
            services: completedServices,
            error: (...args: any[]) => {
                return new ControllerServiceError(args);
            },
        };

        const action = DefinedServices[serviceKey];
        let serviceResult: any | ControllerServiceError;

        if (Array.isArray(action)) {
            serviceResult = action[0](
                options,
            );
        } else {
            serviceResult = DefinedServices[serviceKey](
                requestServices[serviceKey],
                options,
            );
        }

        if ($.utils.isPromise(serviceResult)) {
            serviceResult = await serviceResult;
        }

        // Run user defined error
        if (serviceResult instanceof ControllerServiceError && error) {
            serviceResult = error(x, ...serviceResult.args);
        }

        if (serviceResult instanceof ServerResponse) {
            return serviceResult;
        }

        // Add ServiceKey to completed service keys.
        completedServices[serviceKey] = serviceResult;
    }

    const completedServiceKeys = Object.keys(completedServices);
    const lastCompletedService = completedServiceKeys[completedServiceKeys.length - 1];

    if (lastCompletedService) {
        return completedServices[lastCompletedService];
    }
};
