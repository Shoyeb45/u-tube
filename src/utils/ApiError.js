// We'll define our own API error which will extend Error class, and we can modify the error format as per our requirement

class ApiError extends Error {
    constructor(
        statusCode,
        message = "Something went wrong", // If no message is provided then default message
        errors = [],
        stack = ""
    ) {
        super(message);
        this.statusCode = statusCode;
        this.data = null;
        this.message = message;
        this.success = false;
        this.errors = errors;

        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor); // It generates a stack trace and excludes the ApiError constructor itself from the trace, focusing only on the relevant part of the call stack.
        }
    }
}