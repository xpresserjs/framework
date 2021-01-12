const {spawn} = require('child_process');

/**
 * Lets assume you are calling process manager from your project root.
 * @type {string}
 */
const RootDir = __dirname;

class ProcessManager {
    private rootDir: string = './';

    constructor(rootDir?: string) {
        if (rootDir !== undefined) {
            this.rootDir = rootDir;
        } else {
            this.rootDir = RootDir;
        }

        if (this.rootDir.substr(-1) === '/') {
            this.rootDir = this.rootDir.substr(0, this.rootDir.length - 1)
        }
    }

    addCommandProcess(file: string, $command: string) {
        // const processes = this.currentData();
        const $commands = $command.trim().split(' ');
        const [, ...$afterFirstCommand] = $commands;
        const $process = spawn($commands[0], $afterFirstCommand);

        $process.stdout.on('data', (msg: any) => {
            console.log(msg.toString().trim())
        });
    }
}

module.exports = ProcessManager;
