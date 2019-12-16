import ControllerServiceError = require("./ControllerServiceError");

// Import Types
import {DollarSign} from "../../index";
import {Http} from "../../xpresser/http";
import {ServerResponse} from "http";

declare const $: DollarSign;

export = async (
    x: Http.Request,
    boot: any,
    requestServices: any,
    config: {
        services?: object,
    },
    error: (...args) => any,
) => {
    const DefinedServices = config.services || {};
    const completedServices = {};
    const serviceKeys = Object.keys(requestServices);

    for (const serviceKey of serviceKeys) {
        const options = {
            boot,
            http: x,
            services: completedServices,
            error: (...args) => {
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

        if (serviceResult instanceof ServerResponse) {
            break;
        }

        // Run user defined error
        if (serviceResult instanceof ControllerServiceError && error) {
            serviceResult = error(x, ...serviceResult.args);
            break;
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
