/**
 * Check if a variable is null or undefined.
 * @param item
 */
export function isNullOrUndefined(item: any) {
    return item === null || item === undefined;
}

/**
 * Checks if variable is null or undefined.
 *
 * Returns variable value if defined else returns value of alt variable or function.
 * @param variable
 * @param alt
 */
export function ifNotDefined<T>(variable: T | (() => T), alt: T | (() => T)): T {
    if (typeof variable === "function") {
        variable = (variable as Function)();
    }

    if (isNullOrUndefined(variable) && typeof alt === "function") {
        alt = (alt as Function)();
    }

    return (isNullOrUndefined(variable) ? alt : variable) as T;
}


/**
 * Checks if variable is defined.
 *
 * Returns variable value if defined else returns value of alt variable or function.
 * @param variable
 * @param alt
 */
export function ifOrElse<T>(variable: T | (() => T), alt: T | (() => T)): T {
    if (typeof variable === "function") {
        variable = (variable as Function)();
    }

    if (!variable && typeof alt === "function") {
        alt = (alt as Function)();
    }

    return (variable ? variable : alt) as T;
}