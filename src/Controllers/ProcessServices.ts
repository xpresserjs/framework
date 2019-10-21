import {Xpresser} from "../../xpresser";
import {XpresserHttp} from "../../types/http";
import {ServerResponse} from "http";
import ControllerServiceError = require("./ControllerServiceError");
import ObjectCollection = require("object-collection/index");
import PathHelper = require("../Helpers/Path");

declare const $: Xpresser;

/**
 * AutoLoad Controller Services.
 */
const $useDotJson: ObjectCollection = $.engineData.get("UseDotJson");
const AutoLoadPaths = $useDotJson.get("autoload.controllerServices", undefined);
const ServicesFolder = $.path.controllers("services");

// If use.json has autoload config and services folder exists in controllers folder.
if (AutoLoadPaths && $.file.isDirectory(ServicesFolder)) {
    const ServicesFolderFiles = $.file.readDirectory(ServicesFolder);
    const path2d = PathHelper.addProjectFileExtension("AutoLoad.js");
    console.log(path2d);
}

export = async (
    x: XpresserHttp.Engine,
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
            services: serviceKeys,
            completed: completedServices,
            error: (...args) => {
                return new ControllerServiceError(args);
            },
        };

        const action = DefinedServices[serviceKey];
        let serviceResult: any | ControllerServiceError;

        if (Array.isArray(action)) {
            serviceResult = action[0](
                x,
                options,
            );
        } else {
            options["http"] = x;
            serviceResult = DefinedServices[serviceKey](
                requestServices[serviceKey],
                options,
            );
        }

        const serviceResultIsControllerServiceError: boolean = serviceResult instanceof ControllerServiceError;

        if (serviceResultIsControllerServiceError && error) {
            // Run user defined error
            serviceResult = error(x, ...serviceResult.args);
        }

        if (serviceResult instanceof ServerResponse || serviceResultIsControllerServiceError) {
            break;
        }

        completedServices[serviceKey] = serviceResult;
    }

    const completedServiceKeys = Object.keys(completedServices);
    const lastCompletedService = completedServiceKeys[completedServiceKeys.length - 1];

    if (lastCompletedService) {
        return completedServices[lastCompletedService];
    }
};
