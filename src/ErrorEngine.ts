import RequestEngine = require("./RequestEngine");

class ErrorEngine {
    public http: RequestEngine;

    constructor(http: RequestEngine) {
        this.http = http;
    }

    public view(data: any, status = 500) {
        this.http.res.status(500);
        return this.http.renderViewFromEngine("__errors/index", data);
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

    public pageNotFound(req: any) {
        const error = {
            title: `404 Error!`,
            message: `<code>${req.method}: ${req.url}</code> <br><br> Route not found!`,
        };

        return this.view({error}, 400);
    }
}

export = ErrorEngine;
