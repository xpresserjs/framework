class InXpresserError extends Error {
    public date: Date;

    constructor(message?: string | undefined) {
        super(message);

        this.date = new Date();
        const dateString = new Date().toLocaleDateString('en-US', {
            day: 'numeric',
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric',
        });

        console.log()
        console.log(`---------------Occurred: ${dateString}---------------`)

        // Ensure the name of this error is the same as the class name
        this.name = 'Error';
        // This clips the constructor invocation from the stack trace.
        // It's not absolutely essential, but it does make the stack trace a little nicer.
        //  @see Node.js reference (bottom)
        Error.captureStackTrace(this, this.constructor);
    }
}

export = InXpresserError;