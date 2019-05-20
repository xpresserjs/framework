const fs = require('fs');
const {mkdirpSync} = require('fs-extra');
const {spawn} = require('child_process');
const ps = require('ps-node');

/**
 * Lets assume you are calling process manager from your project root.
 * @type {string}
 */
const RootDir = __dirname;
const Database = 'processes.json';

class ProcessManager {
    constructor(rootDir = undefined) {
        if (rootDir !== undefined) {
            this.rootDir = rootDir;
        } else {
            this.rootDir = RootDir;
        }

        if (this.rootDir.substr(-1) === '/') {
            this.rootDir = this.rootDir.substr(0, this.rootDir.length - 1)
        }

        if (!fs.existsSync(this.storageLocation())) {
            mkdirpSync(this.storageLocation());
        }
    }

    database() {
        return this.storageLocation(Database);
    }

    storageLocation($path = '') {
        return this.rootDir + '/storage/framework/console/' + $path;
    }

    currentData() {
        if (!fs.existsSync(this.database())) {
            return {};
        }

        const content = fs.readFileSync(this.database()).toString().trim();
        return content.length ? JSON.parse(content) : {}
    }

    addCommandProcess($file, $command) {
        let processes = this.currentData();
        let $commands = $command.trim().split(' ');
        let [, ...$afterFirstCommand] = $commands;
        let $process = spawn($commands[0], $afterFirstCommand);


        if (typeof processes[$file] === "undefined") {
            processes[$file] = []
        }

        processes[$file].push({
            id: $process.pid,
            command: $command
        });


        fs.writeFileSync(this.database(), JSON.stringify(processes, null, 2))
    }

    removeCommandProcess($file, $process) {
        $process = Number($process);
        let processes = this.currentData();
        if (processes[$file] !== undefined) {
            let processData = processes[$file];
            for (let i = 0; i < processData.length; i++) {
                const processDataItem = processData[i];
                if (processDataItem.id === $process) {
                    processes[$file].splice(i, 1);
                    break;
                }
            }
        }

        fs.writeFileSync(this.database(), JSON.stringify(processes, null, 2))
    }

    endProcess($file, $process) {
        let processes = this.currentData();

        if (processes[$file] !== undefined) {
            let processData = processes[$file];

            for (let i = 0; i < processData.length; i++) {
                let processDataItem = processData[i];
                if ($process === 'all' || processDataItem.id === $process) {
                    let self = this;

                    ps.kill(processDataItem.id, () => {
                        self.removeCommandProcess($file, processDataItem.id);
                    });

                    if ($process !== 'all')
                        break;
                }
            }
        }
    }
}

ProcessManager.prototype.rootDir = './';

module.exports = ProcessManager;