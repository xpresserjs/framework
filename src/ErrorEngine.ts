import RequestEngine = require("./RequestEngine");

class ErrorEngine {
    public http: RequestEngine;

    constructor(http: RequestEngine) {
        this.http = http;
    }

    public view(data: { error?: {title?: string, message?: string, log?: string} }, status = 500) {
        return this.http.status(status).renderViewFromEngine("__errors/index", data);
    }

    public controllerMethodNotFound(e: any, method = "", controller = "") {
        method = `<code> {${method}} </code>`;
        if (controller.length) {
            controller = `<code>{${controller}}</code>`;
        }

        const error = {
            message: `Controller ${controller} does not have method ${method}`,
            log: e,
        };

        return this.view({error});
    }

    public pageNotFound() {
        const req = this.http.req;
        const error = {
            title: `404 Error!`,
            message: `<code>${req.method}: ${req.url}</code> <br><br> Route not found!`,
        };

        return this.view({error}, 400);
    }
}

export = ErrorEngine;
