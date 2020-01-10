const {spawn} = require('child_process');

/**
 * Lets assume you are calling process manager from your project root.
 * @type {string}
 */
const RootDir = __dirname;

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
    }

    addCommandProcess(file, $command) {
        // const processes = this.currentData();
        const $commands = $command.trim().split(' ');
        const [, ...$afterFirstCommand] = $commands;
        const $process = spawn($commands[0], $afterFirstCommand);

        $process.stdout.on('data', (msg) => {
            console.log(msg.toString().trim())
        });

        /**
         * @deprecated - No need storing process ids.
         */
        /*if (typeof processes[file] === "undefined") {
            processes[file] = []
        }

        processes[file].push({
            id: $process.pid,
            command: $command
        });


        fs.writeFileSync(
            this.database(),
            JSON.stringify(processes, null, 2)
        )*/
    }
}

ProcessManager.prototype.rootDir = './';

module.exports = ProcessManager;
