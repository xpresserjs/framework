import RequestEngine = require("./RequestEngine");

class ErrorEngine {
    public x: RequestEngine;

    constructor(x) {
        this.x = x;
    }

    public view(data) {
        return this.x.renderViewFromEngine("__errors/index", data);
    }

    public controllerMethodNotFound(e, method = "", controller = "") {
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

    public pageNotFound(req) {
        const error = {
            title: `404 Error!`,
            message: `<code>${req.method}: ${req.url}</code> <br><br> Route not found!`,
        };

        return this.view({error});
    }
}

export = ErrorEngine;
