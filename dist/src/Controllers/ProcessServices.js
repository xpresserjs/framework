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
const http_1 = require("http");
const ControllerServiceError = require("./ControllerServiceError");
module.exports = (x, requestServices, config, error) => __awaiter(void 0, void 0, void 0, function* () {
    const DefinedServices = config.services || {};
    const completedServices = {};
    const serviceKeys = Object.keys(requestServices);
    for (const serviceKey of serviceKeys) {
        const options = {
            http: x,
            services: completedServices,
            error: (...args) => {
                return new ControllerServiceError(args);
            },
        };
        const action = DefinedServices[serviceKey];
        let serviceResult;
        if (Array.isArray(action)) {
            serviceResult = action[0](options);
        }
        else {
            serviceResult = DefinedServices[serviceKey](requestServices[serviceKey], options);
        }
        if ($.fn.isPromise(serviceResult)) {
            serviceResult = yield serviceResult;
        }
        if (serviceResult instanceof http_1.ServerResponse) {
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
});
