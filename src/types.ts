import fs from "fs";

/**
 * Un-Categorized Types
 */
export interface DeleteDirOptions extends fs.RmOptions {
    returnList?: boolean
}