import express = require("express");
import RequestEngine = require("../src/RequestEngine");

declare namespace XpresserHttp {
    type Engine = RequestEngine;

    interface Request extends express.Request {
        session: object;
        flash: (key?: string, value?: any) => void;
    }

    type Response = express.Response;
}
