import * as express from "express";
import RequestEngine from "../src/RequestEngine";
import ControllerServiceError from "../src/Controllers/ControllerServiceError";
import ControllerService from "../src/Controllers/ControllerService";

declare namespace Xpresser {

    // tslint:disable-next-line:no-empty-interface
    interface Http extends RequestEngine {
    }

    namespace Http {
        interface Request extends express.Request {
            // session: any
            flash?(key?: string, value?: any): any
        }

        // tslint:disable-next-line:no-empty-interface
        interface Response extends express.Response {
        }
    }

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
        type InlineServiceMethod = (context: ServiceContext) => (any | void);
        type MiddlewareWithHelper = (helpers: {
            use: MethodWithHttp,
        }) => Record<string, any>;

        interface MethodWithServices {
            // Controller Service
            [name: string]: InlineServiceMethod | any;
        }

        type ErrorHandler = (...args: any[]) => any;
        type MethodWithBoot = (http: Http, boot: any, error: ErrorHandler) => (any | void);
        type ActionResponse = Http.Response | void

        type Object<Boot = any> = {
            // Name of Controller.
            name: string;

            /**
             * Default controller error handler.
             * Available to all service functions,
             *
             * @example
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
            e?: (http: Http, ...args: any[]) => ActionResponse | Promise<ActionResponse>;

            /**
             * Register Middlewares
             * @param helpers
             */
            middleware?: MiddlewareWithHelper;

            /**
             * Register middlewares using object
             */
            middlewares?: Record<string, any>;

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
            boot?: (http: Http, error: ErrorHandler) => (any | void) | Promise<any | void>;
        } | {
            [action: string]: (http: Http, boot: Boot, error: ErrorHandler) => ActionResponse | Promise<ActionResponse>;
        }

        // interface Object {
        //     // Name of Controller.
        //     name: string;
        //
        //
        //     e?: (http: Http, ...args: any[]) => Http.Response | void;
        //
        //
        //     [name: string]: MethodWithBoot | ErrorHandler | MiddlewareWithHelper | Record<string, any> | string | undefined;
        // }

        // tslint:disable-next-line:no-empty-interface
        interface Handler extends ControllerService {

        }

        class Class {
            public static middleware(helpers?: { use?: MethodWithBoot }): object;

            public static boot(http: Http, error?: () => (any | void)): object;
        }
    }

    namespace HttpError {
        type Data = { in?: string, title?: string, html?: string, log?: string };
        type onError = { onError: (e: any, data: HttpError.Data) => void }
    }
}

export = Xpresser;
