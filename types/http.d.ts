import express = require("express");
import RequestEngine = require("../src/RequestEngine");
import ControllerServiceError = require("../src/Controllers/ControllerServiceError");

declare namespace XpresserHttp {
    type Engine = RequestEngine;

    interface Request extends express.Request {
        session: object;
        flash: (key?: string, value?: any) => void;
    }

    type Response = express.Response;
}

declare namespace XpresserController {
    interface ServicesContext {
        http?: XpresserHttp.Engine;
        boot: any;
        services?: any;
        error?: (...args) => ControllerServiceError;
    }

    interface Services {
        /**
         * Controller Service
         * @param options - option passed to service in controller method.
         * @param context - Your current request and services context
         */
        [name: string]: (options: any, context?: XpresserController.ServicesContext) => {};
    }

    type Method = (http?: XpresserHttp.Engine) => any;
    type MethodWithBoot = (http?: XpresserHttp.Engine, boot?: any) => (any | void);
    type MethodInlineService = (context?: XpresserController.ServicesContext) => any;

    interface MethodWithServices {
        // Controller Service
        [name: string]: XpresserController.MethodInlineService | any;
    }

    interface ControllerObject {
        // Name of Controller.
        name?: string;
        /**
         * Default controller error handler.
         * Available to all service functions,
         *
         * const service: (option, {error}) => {
         *     error("arg1", "arg2")
         * }
         *
         * Arg1 and Arg2 will be passed to your error function after
         * xpresser RequestEngine variable.
         *
         * @param http
         * @param args
         */
        e?: (http: XpresserHttp.Engine, ...args) => (any | void);

        // Register Middlewares
        middleware?: (helpers?: {
            use: XpresserController.Method,
        }) => any;
        /**
         * Boot method.
         * Any value returned in this function is passed to your
         * controller method and services method
         *
         * controller(http, boot);
         *
         * service(option, {boot});
         *
         * inlineService({boot}
         */
        boot: XpresserController.MethodWithBoot;

        // Controller Method
        [name: string]: any | XpresserController.Method | XpresserController.MethodWithServices;
    }
}
