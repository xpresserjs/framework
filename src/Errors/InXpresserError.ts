import os = require("os");
import colors = require("../Objects/consoleColors.obj");

/**
 * InXpresserError
 *
 * This is xpresser's default Error handler.
 * It defers from the default node Error handler because it has the time of error in its data.
 */
class InXpresserError extends Error {
    // Holds Date
    public date: Date;
    // Holds human readable DateString
    public dateString: string;

    constructor(message?: string | undefined) {
        super(message);

        this.date = new Date();
        const dateString = this.dateString = new Date().toLocaleDateString('en-US', {
            day: 'numeric',
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric',
        });

        console.log(colors.fgRed)
        console.log(`>>>>>>>>> Occurred: ${dateString} <<<<<<<<<<`, colors.reset)

        // Ensure the name of this error is the same as the class name
        this.name = 'Error';
        // This clips the constructor invocation from the stack trace.
        // It's not absolutely essential, but it does make the stack trace a little nicer.
        //  @see Node.js reference (bottom)
        Error.captureStackTrace(this, this.constructor);
    }

    static tryOrCatch<T>(fn: () => T): T | void {
        try {
            return fn();
        } catch (e) {
            console.log(this.use(e));
        }
    }

    static use(e: Error) {
        const error = new this(e.message)
        const stack: string[] = e.stack!.split(os.EOL);
        stack.splice(0, 1);
        stack.unshift(error.stack!.split(os.EOL)[0])
        error.stack = stack.join(os.EOL);
        return error;
    }
}

export = InXpresserError;