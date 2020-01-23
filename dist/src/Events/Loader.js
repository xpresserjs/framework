"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const Path = require("../Helpers/Path");
const DefinedEvents = {};
const EventsPath = $.path.events();
if (fs.existsSync(EventsPath)) {
    $.logIfNotConsole("Loading Events...");
    // Load all event files
    const $useDotJson = $.engineData.get("UseDotJson");
    const excludedFiles = $useDotJson.get("exclude.events.files", []);
    const excludedFolders = $useDotJson.get("exclude.events.folders", []);
    Path.addProjectFileExtension(excludedFiles);
    const readEventsDirectory = (parent) => {
        const Events = fs.readdirSync(parent);
        for (let i = 0; i < Events.length; i++) {
            const event = Events[i];
            const fullPath = parent + "/" + event;
            const shortPath = fullPath.replace(EventsPath + "/", "");
            if (fs.lstatSync(fullPath).isDirectory()) {
                // Get events not excluded in use.json
                if (!excludedFolders.includes(event)) {
                    readEventsDirectory(fullPath);
                }
            }
            else {
                // Get events not excluded in use.json
                if (!excludedFiles.includes(event)) {
                    let event;
                    try {
                        event = require(fullPath);
                    }
                    catch (e) {
                        $.logPerLine([
                            { error: `Error in ${shortPath}` },
                            { errorAndExit: e },
                            { errorAndExit: e.stack },
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
    };
    $.ifConsole(() => {
        if ($.config.artisan.loadEvents) {
            readEventsDirectory(EventsPath);
        }
    }, () => {
        readEventsDirectory(EventsPath);
    });
}
// Import Emitter
const EventsEmitter = require("./Emitter");
// Set global $.events to Emitter
$.events = EventsEmitter(DefinedEvents);
