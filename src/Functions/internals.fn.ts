
export function parseControllerString(controllerString: string) {
    const split = controllerString.split("@");
    let startIndex = 0;
    if (split.length > 2) startIndex = split.length - 2;
    const method = split[startIndex + 1];

    return {
        controller: controllerString.replace(`@${method}`, ''),
        method
    }
}