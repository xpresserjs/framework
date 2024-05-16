import fs from "fs";
import {getInstance} from "../../index";
import Path from "../Helpers/Path";
import ObjectCollection from "object-collection/index";
import EventsEmitter from "./Emitter";

const $ = getInstance();
const DefinedEvents: Record<string, any> = {};
const EventsPath = $.path.events();

// Load all event files
const $useDotJson: ObjectCollection = $.engineData.get("UseDotJson");
const excludedFiles: string[] = $useDotJson.get("exclude.events.files", []);
const excludedFolders: string[] = $useDotJson.get("exclude.events.folders", []);
Path.addProjectFileExtension(excludedFiles);

function readEventsDirectory (parent: string) {
    const Events = fs.readdirSync(parent);

    for (let i = 0; i < Events.length; i++) {
        const event: string[] | string = Events[i];
        const fullPath = parent + "/" + event;
        const shortPath = fullPath.replace(EventsPath + "/", "");

        if (fs.lstatSync(fullPath).isDirectory()) {
            // Get events not excluded in use.json
            if (!excludedFolders.includes(event)) {
                readEventsDirectory(fullPath);
            }
        } else {
            // Get events not excluded in use.json
            if (!excludedFiles.includes(event)) {
                let event: any;

                try {
                    event = require(fullPath);
                } catch (e) {
                    $.logPerLine([
                        {error: `Error in ${shortPath}`},
                        {error: e},
                    ]);
                }

                if (typeof event === "object") {
                    const eventKeys = Object.keys(event);
                    const namespace = event.namespace || Path.removeProjectFileExtension(shortPath);

                    for (let j = 0; j < eventKeys.length; j++) {
                        const eventKey = eventKeys[j];
                        if (typeof event[eventKey] === "function") {
                            let name = namespace;

                            if (eventKey !== "index") {
                                name = `${namespace}.${eventKey}`;
                            }

                            DefinedEvents[name] = event[eventKey];
                        }
                    }
                }
            }
        }
    }
}

if (fs.existsSync(EventsPath)) {
    $.ifConsole(() => {
        if ($.config.get('artisan.loadEvents')) {
            readEventsDirectory(EventsPath);
        }
    }, () => {
        readEventsDirectory(EventsPath);
    });
}

// Set global $.events to Emitter
$.events = EventsEmitter(DefinedEvents);
