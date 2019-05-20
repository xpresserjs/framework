import express = require("express");

declare namespace XjsHttp {
    interface Request extends express.Request {
        session: object;
        flash: (key?: string, value?: any) => void;
    }

    interface Response extends express.Response {
        foo: string;
    }
}
