"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const http_1 = require("http");
const HandlerError = require("./HandlerError");
module.exports = (x, requestTasks, config, error) => __awaiter(void 0, void 0, void 0, function* () {
    const DefinedTasks = config.tasks || {};
    const completedTasks = {};
    const taskKeys = Object.keys(requestTasks);
    for (const taskKey of taskKeys) {
        const options = {
            tasks: taskKeys,
            completedTasks,
            error: (...args) => {
                return new HandlerError(args);
            },
        };
        const action = DefinedTasks[taskKey];
        let taskResult;
        if (Array.isArray(action)) {
            taskResult = action[0](x, options);
        }
        else {
            options["http"] = x;
            taskResult = DefinedTasks[taskKey](requestTasks[taskKey], options);
        }
        const taskResultIsHandlerError = taskResult instanceof HandlerError;
        if (taskResultIsHandlerError && error) {
            // Run user defined error
            taskResult = error(x, ...taskResult.args);
        }
        if (taskResult instanceof http_1.ServerResponse || taskResultIsHandlerError) {
            break;
        }
        completedTasks[taskKey] = taskResult;
    }
    const completedTaskKeys = Object.keys(completedTasks);
    const lastCompletedTask = completedTaskKeys[completedTaskKeys.length - 1];
    if (lastCompletedTask) {
        return completedTasks[lastCompletedTask];
    }
});
