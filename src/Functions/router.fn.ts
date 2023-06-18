import {parse} from "path-to-regexp";


export function pathToUrl(path: string | any) {
    if (typeof path !== "string") return path as string;

    try {
        const segments = parse(path);
        const newUrl: string[] = [];
        for (const segment of segments) {
            if (typeof segment === "string") {
                newUrl.push(segment);
            } else {
                newUrl.push(segment.prefix + "_??_");
            }
        }

        return newUrl.join("");
    } catch {
        return path;
    }

}