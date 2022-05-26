import type {HttpError} from "../types/http";
import type RequestEngine from "./RequestEngine";

const statusCodes = {
    400: "Bad Request",
    401: "Unauthorized",
    404: "Not Found",
    500: "Server Error",
}


class ErrorEngine {
    public http: RequestEngine;
    public error?: any;

    constructor(http: RequestEngine, e?: any) {
        this.http = http;
        this.error = e;
    }

    hasCustomErrorHandler() {
        return typeof (this.http as any)["onError"] === "function";
    };

    public view(data: {error: HttpError.Data}, status = 500) {
        if (this.hasCustomErrorHandler()) {
            return (this.http as unknown as HttpError.onError)["onError"](this.error, data.error);
        }

        return this.http.status(status).renderViewFromEngine("__errors/index", {
            ...data,
            statusCode: status,
            statusCodes
        });
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
