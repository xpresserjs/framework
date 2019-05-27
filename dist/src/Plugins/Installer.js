"use strict";
const fs = require("fs");
const moment = require("moment");
const PathHelper = require("../Helpers/Path");
const ObjectCollection = require("../Helpers/ObjectCollection");
const PluginLockDataPath = PathHelper.frameworkStorage("plugins-lock.json");
let PluginLockData = new ObjectCollection();
let UpdatePluginLockData = false;
PathHelper.makeDirIfNotExist(PluginLockDataPath, true);
if (fs.existsSync(PluginLockDataPath)) {
    const lockData = require(PluginLockDataPath);
    PluginLockData = new ObjectCollection(lockData);
}
module.exports = ($plugin) => {
    // Get all loaded plugin namespace
    const $pluginNamespaces = $.engineData.get("PluginEngine:namespaces");
    const $pluginNamespaceKeys = Object.keys($pluginNamespaces);
    let $pluginData = null;
    // Loop Through all to find exact plugin to install
    for (let i = 0; i < $pluginNamespaceKeys.length; i++) {
        const $pluginNamespace = $pluginNamespaces[$pluginNamespaceKeys[i]];
        if ($pluginNamespace.plugin === $plugin) {
            $pluginData = $pluginNamespace;
            break;
        }
    }
    if ($pluginData === null) {
        return $.logErrorAndExit(`Plugin: ${$plugin} not found.`);
    }
    const $pluginLockData = PluginLockData.getNewInstance($plugin);
    if ($pluginLockData.get("installed", false)) {
        return $.logPerLine([
            { info: `Plugin: ${$plugin} is already installed!` },
            { errorAndExit: "" },
        ]);
    }
    $.logInfo(`Installing ${$plugin}...`);
    if ($pluginData.hasOwnProperty("migrations")) {
        const $migrationLockData = $pluginLockData.getNewInstance("migrations");
        const $migrationsFolder = $pluginData.migrations;
        const $migrationFiles = fs.readdirSync($migrationsFolder);
        if ($migrationFiles.length) {
            PathHelper.makeDirIfNotExist($.path.base("migrations"));
        }
        for (let i = 0; i < $migrationFiles.length; i++) {
            const $migrationFile = $migrationFiles[i];
            const $splitMigrationFileName = $migrationFile.split("_");
            let $newMigrationFilePath = $migrationFile;
            if (!isNaN(Number($splitMigrationFileName[0]))) {
                $splitMigrationFileName[0] = moment(new Date())
                    .format("YMMDHmmss")
                    .toString() + "::" + $pluginData.namespace.toLowerCase();
            }
            const $newMigrationFile = $splitMigrationFileName.join("_");
            $newMigrationFilePath = $.path.base("migrations/" + $newMigrationFile);
            const $migrationFileFullPath = $migrationsFolder + "/" + $migrationFile;
            if (!$migrationLockData.has($newMigrationFile)) {
                fs.copyFileSync($migrationFileFullPath, $newMigrationFilePath);
                $.logInfo(`Moved migration: ${$newMigrationFile}`);
                const $data = {
                    migrations: {
                        [$migrationFile]: $newMigrationFile,
                    },
                };
                PluginLockData.mergeWith($plugin, $data);
                UpdatePluginLockData = true;
            }
        }
    }
    if ($pluginData.hasOwnProperty("models")) {
        const $models = fs.readdirSync($pluginData.models);
        for (let i = 0; i < $models.length; i++) {
            const $modelFile = $models[i];
            let $model = $models[i];
            const $newModel = _.upperFirst($pluginData.namespace) + "/" + $model;
            $model = $pluginData.models + "/" + $model;
            const $newModelFullPath = $.path.models($newModel);
            PathHelper.makeDirIfNotExist($newModelFullPath, true);
            if (!fs.existsSync($newModelFullPath)) {
                fs.copyFileSync($model, $newModelFullPath);
            }
            $.logInfo(`Moved model: ${$newModel}`);
            const $data = {
                models: {
                    [$modelFile]: $newModel,
                },
            };
            PluginLockData.mergeWith($plugin, $data);
            UpdatePluginLockData = true;
        }
    }
    const $pluginIsInstalled = $pluginLockData.get("installed", false);
    if (!$pluginIsInstalled) {
        try {
            const pluginInit = require($pluginData.path);
            if (typeof pluginInit.install === "function") {
                pluginInit.install();
            }
            $pluginLockData.set("installed", true);
            UpdatePluginLockData = true;
        }
        catch (e) {
            $.logError($plugin);
            $.logErrorAndExit(e.message);
        }
    }
    if (UpdatePluginLockData) {
        fs.writeFileSync(PluginLockDataPath, JSON.stringify(PluginLockData.all(), null, 2));
        $.logInfo("Updated plugins-lock.json");
    }
    $.logInfo("Installation Complete!");
};
//# sourceMappingURL=Installer.js.map