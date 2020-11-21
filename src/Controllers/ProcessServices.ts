import ControllerServiceError = require("./ControllerServiceError");
// Import Types
import {Http} from "../../types/http";
import {ServerResponse} from "http";


/**
 * This functions loops through all defined services,
 * Runs them and add any data returned to the services object.
 *
 * Each service gets the data returned by the previous service object.
 */
export = async (
    http: Http.Request,
    boot: any,
    requestServices: any,
    config: {
        services?: object,
    },
    error: (...args: any[]) => any,
) => {

    // List of services defined in this controller
    const DefinedServices: Record<string, any> = config.services || {};
    // Holds data of each completed service
    const completedServices: Record<string, any> = {};
    const serviceKeys = Object.keys(requestServices);

    // Each service error handler.
    const serviceErrorHandler = (...args: any[]) => {
        return new ControllerServiceError(args);
    };

    // loop through services.
    for (const serviceKey of serviceKeys) {
        const options = {
            boot,
            http,
            services: completedServices,
            error: serviceErrorHandler
        };

        // Service action [function | string]
        const action = DefinedServices[serviceKey];
        let serviceResult: any | ControllerServiceError;

        if (Array.isArray(action)) {
            serviceResult = await action[0](options);
        } else {
            serviceResult = await DefinedServices[serviceKey](
                requestServices[serviceKey],
                options,
            );
        }

        // Run user defined error
        if (serviceResult instanceof ControllerServiceError && error) {
            serviceResult = error(http, ...serviceResult.args);
        }

        // if a service returns ServerResponse then stop loop and return that response.
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
