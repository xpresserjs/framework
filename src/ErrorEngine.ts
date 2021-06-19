import RequestEngine = require("./RequestEngine");

const statusCodes = {
    400: "Bad Request",
    401: "Unauthorized",
    404: "Not Found",
    500: "Server Error",
}

class ErrorEngine {
    public http: RequestEngine;

    constructor(http: RequestEngine) {
        this.http = http;
    }

    public view(data: { error?: {title?: string, message?: string, log?: string} }, status = 500) {
        return this.http.status(status).renderViewFromEngine("__errors/index", {...data, statusCode: status, statusCodes});
    }

    public pageNotFound() {
        const req = this.http.req;

        const error = {
            title: `404 Error!`,
            message: `<code>${req.method}: ${req.url}</code> <br><br> Route not found!`,
        };

        return this.view({error}, 404);
    }
}

export = ErrorEngine;
