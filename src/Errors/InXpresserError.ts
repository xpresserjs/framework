import os = require("os");

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
        this.dateString = new Date().toLocaleDateString('en-US', {
            day: 'numeric',
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric',
        });

        // Ensure the name of this error is the same as the class name
        this.name = 'Error';
        // This clips the constructor invocation from the stack trace.
        // It's not absolutely essential, but it does make the stack trace a little nicer.
        //  @see Node.js reference (bottom)
        Error.captureStackTrace(this, this.constructor);
    }

    /**
     * TryOrCatch
     *
     * this method runs any function passed to it in a try catch.
     * It also returns the value of the function called or logs error.
     *
     * **Note:** It does not throw errors, only console.logs them.
     * @param fn
     */
    static try<T>(fn: () => T): T {
        return this.tryOrCatch(fn, (e) => {
            console.log(e);
        })
    }

    /**
     * TryOrCatch
     *
     * this method runs any function passed to it in a try catch.
     * It also returns the value of the function called or logs error.
     *
     * **Note:** It throw errors
     * @param fn
     * @param handleError
     */
    static tryOrCatch<T>(fn: () => T, handleError?: (error: InXpresserError) => any): T {
        try {
            return fn();
        } catch (e) {
            if(handleError) return handleError(this.use(e));
            throw this.use(e);
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