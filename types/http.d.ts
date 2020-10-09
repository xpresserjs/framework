import express = require("express");
import RequestEngine = require("../src/RequestEngine");
import ControllerServiceError = require("../src/Controllers/ControllerServiceError");
import ControllerService = require("../src/Controllers/ControllerService");

declare namespace Xpresser {
    namespace Http {
        interface Request extends express.Request {
            session: object;
            flash: (key?: string, value?: any) => void;
        }

        interface Response extends express.Response {
            [name: string]: any;
        }
    }

    type Http = RequestEngine

    namespace Controller {

        interface ServiceContext {
            http: Http;
            boot: any;
            services: any;
            error: (...args: any[]) => ControllerServiceError;
        }

        interface Services {
            /**
             * Controller Service
             * @param options - option passed to service in controller method.
             * @param context - Your current request and services context
             */
            [name: string]: (options: any, context: ServiceContext) => (any | void);
        }

        type MethodWithHttp = (http: Http) => (any | void);
        type BootMethod = (http: Http, error: () => (any | void)) => object;
        type MethodWithBoot = (http: Http, boot: any, error: () => (any | void)) => (any | void);
        type InlineServiceMethod = (context: ServiceContext) => (any | void);

        interface MethodWithServices {
            // Controller Service
            [name: string]: InlineServiceMethod | any;
        }

        type Object = {
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
            e?: (http: Http, ...args: any[]) => (any | void);

            /**
             * Register Middlewares
             * @param helpers
             */
            middleware?: (helpers?: {
                use: MethodWithHttp,
            }) => object;

            /**
             * Register middlewares using object
             */
            middlewares?: object;
            /**
             * Boot method.
             * Any value returned in this function is passed to your
             * controller method and services method
             *
             * controller(http, boot);
             *
             * service(option, {boot});
             *
             * inlineService({boot});
             */
            boot?: BootMethod;
        } | { [name: string]: MethodWithHttp | MethodWithServices }

        // tslint:disable-next-line:no-empty-interface
        interface Handler extends ControllerService {

        }

        class Class {
            public static middleware(helpers?: { use?: MethodWithBoot }): object;

            public static boot(http: Http, error?: () => (any | void)): object;
        }
    }
}

export = Xpresser;
