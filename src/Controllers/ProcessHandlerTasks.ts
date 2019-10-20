// import {Xpresser} from "../../xpresser";
import {XpresserHttp} from "../../types/http";
import {ServerResponse} from "http";
import HandlerError = require("./HandlerError");

// declare const $: Xpresser;

export = async (
    x: XpresserHttp.Engine,
    requestTasks: any,
    config: {
        tasks?: object,
    },
    error: (...args) => any,
) => {
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
        let taskResult: any | HandlerError;

        if (Array.isArray(action)) {
            taskResult = action[0](
                x,
                options,
            );
        } else {
            options["http"] = x;
            taskResult = DefinedTasks[taskKey](
                requestTasks[taskKey],
                options,
            );
        }

        const taskResultIsHandlerError: boolean = taskResult instanceof HandlerError;

        if (taskResultIsHandlerError && error) {
            // Run user defined error
            taskResult = error(x, ...taskResult.args);
        }

        if (taskResult instanceof ServerResponse || taskResultIsHandlerError) {
            break;
        }

        completedTasks[taskKey] = taskResult;
    }

    const completedTaskKeys = Object.keys(completedTasks);
    const lastCompletedTask = completedTaskKeys[completedTaskKeys.length - 1];

    if (lastCompletedTask) {
        return completedTasks[lastCompletedTask];
    }
};
