"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ModelEngine = require("./ModelEngine");
const RouterEngine = require("./RouterEngine");
$.model = ModelEngine;
$.routerEngine = RouterEngine;
$.backendPath("routers/router", true);
$.routerEngine.processRoutes();
//# sourceMappingURL=StartConsole.js.map