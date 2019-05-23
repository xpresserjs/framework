require('./x');

const consoleCommands = require('./console/Commands');
const colors = require('./objects/consoleColors.obj');

const fs = require('fs');
const {dirname} = require('path');
const fse = require('fs-extra');
const shell = require('shelljs');
const keypress = require('keypress');
const vm = require('vm');
const Inspector = require('util').inspect;
const os = require('os');

const historyFile = $.path.storage('framework/console/tinker.json');
const historyFileFolder = dirname(historyFile);

/* Make historyFile folder if it does not exits! */
if (!fs.existsSync(historyFileFolder)) {
    fse.mkdirSync(historyFileFolder, {recursive: true});
}

const stdin = process.stdin;
const stdout = process.stdout;

keypress(stdin);

stdin.setRawMode(true);
stdin.resume();
stdin.setEncoding('utf-8');


let command = '';
let insideBracket = "";

let cursorPosition = null;
let isEditorMode = false;

let setEditorMode = function (mode) {
    isEditorMode = mode;
};

let isSilent = false;

let history = [];
let currentHistory = 0;

/* Set Content Available in console.*/
const thisContext = vm.createContext(global);
thisContext.require = require;

if (fs.existsSync(historyFile)) {
    const fileData = JSON.parse(fs.readFileSync(historyFile).toString());
    history = $.base64.decodeToJson(fileData['history']);
    currentHistory = history.length;
}


console.log(colors.fgGreen + ">>>>>>>>>>>>>>>>>> HAPPY THINKING. PLAY SAFE!");
console.log(colors.fgCyan);


const clearHistory = function (amount = null) {
    if (history.length) {
        if (amount === null) {
            const lastHistory = history[history.length - 1];
            history = [];
            pushHistory(lastHistory);
        } else {
            for (let i = 0; i <= parseInt(amount); i++) {
                history.splice(i, 1);
            }
        }
    }
};

const pushHistory = function (customCommand = null) {
    if (customCommand !== null) command = customCommand;

    if (history.length >= 100) {
        clearHistory(50);
    }

    for (let i = 0; i < history.length; i++) {
        if (history[i].trim() === command.trim()) {
            history.splice(i, 1);
        }
    }

    history.push(command);
    currentHistory = history.length;
    const data = {history: $.base64.encode(history)};
    return fs.writeFileSync(historyFile, JSON.stringify(data, null, 2));
};

const handleCommand = function () {
    command = command.trim();

    pushHistory();

    if (command === '--silent') {
        command = '';
        cursorPosition = 0;
        console.log();
        return isSilent = !isSilent;

    } else if (command === '/clear') {
        shell.exec('clear');
        console.log(">>>>>>>>>>>>>>>>>> HAPPY THINKING!!!");
        console.log(colors.fgCyan);

    } else if (command === '/clear:history') {

        clearHistory();
        showSuccess('History cleared successfully!');

    } else if (command.substr(0, 1) === '@') {

        const expectedConsoleCommand = command.substr(1);
        const mainCommand = expectedConsoleCommand.split(' ')[0];

        if (typeof consoleCommands[mainCommand] === 'undefined') {

            return showError('{' + mainCommand + '} is not an artisan command!');

        } else {
            shell.exec("node xjs --from-tinker " + expectedConsoleCommand);
        }
    } else {
        try {
            const script = new vm.Script(command, {
                displayErrors: true
            });

            const $return = script.runInContext(thisContext);
            const $typeOfReturn = typeof $return;

            if (!isSilent) {
                if ($typeOfReturn !== "undefined") {
                    console.log(colors.fgYellow + "===> (" + (typeof $return) + '):' + colors.reset, Inspector($return, {colors: true}));
                } else {
                    console.log(colors.fgWhite + "===> " + $return)
                }
            }
        } catch (e) {
            console.log(colors.fgRed, '===>', e.message);
        }
    }

    console.log(colors.fgCyan);
    command = '';
    cursorPosition = 0;
    stdout.clearLine();
    return stdout.cursorTo(0);
};


const addToCommand = function (str) {

    if (str === "eol") {
        setEditorMode(true);
        return stdout.write(os.EOL);
    }

    if (isEditorMode) {
        if (cursorPosition !== null) {
            insideBracket = insideBracket.split('');
            insideBracket.splice(cursorPosition, 0, str);
            insideBracket = insideBracket.join('');
            cursorPosition = insideBracket.length;
            stdout.write(str);
            return stdout.cursorTo(cursorPosition);
        }

        insideBracket += str
    } else {
        if (cursorPosition !== null) {
            command = command.split('');
            command.splice(cursorPosition, 0, str);
            command = command.join('');

            stdout.clearLine();
            stdout.cursorTo(0);
            stdout.write(command);

            cursorPosition = cursorPosition + 1;
            return stdout.cursorTo(cursorPosition);
        } else {
            command += str;
        }

        cursorPosition = command.length;
        stdout.write(str);
        return stdout.cursorTo(cursorPosition);
    }
};

const showError = function (arg) {
    console.log();
    console.log(colors.fgRed, arg, colors.fgCyan);
    console.log();
};

const showSuccess = function (arg) {
    console.log(colors.fgGreen);
    $.log(arg);
    console.log(colors.fgCyan);
};

stdin.on('keypress', function (ch, key) {
    if (key) {
        if (key.name === 'up' && !isEditorMode) {
            if (history.length) {
                let prevHistory = 0;

                if (currentHistory === 0) {
                    return 0;
                } else {
                    prevHistory = currentHistory - 1;
                }

                if (typeof history[prevHistory] !== 'undefined') {
                    command = history[prevHistory];

                    currentHistory = prevHistory;

                    stdout.clearLine();
                    stdout.cursorTo(0);
                    stdout.write(command);

                    cursorPosition = command.length;
                    return stdout.cursorTo(cursorPosition);
                }

            }
        } else if (key.name === 'down' && !isEditorMode) {
            if (history.length > 1) {
                const nextHistory = currentHistory + 1;
                if (typeof history[nextHistory] !== 'undefined') {
                    command = history[nextHistory];
                    currentHistory = nextHistory;

                    stdout.clearLine();
                    stdout.cursorTo(0);
                    stdout.write(command);
                    cursorPosition = command.length;
                    return stdout.cursorTo(cursorPosition);

                } else {
                    cursorPosition = 0;
                    stdout.clearLine();
                    stdout.cursorTo(cursorPosition);
                }

            } else {
                stdout.clearLine();
                cursorPosition = 0;
                command = '';
                return stdout.cursorTo(0);
            }
        } else if (key.name === 'left') {

            if (cursorPosition === null) {
                cursorPosition = command.length - 1
            } else if (cursorPosition === 0) {
                cursorPosition = command.length
            } else {
                cursorPosition = cursorPosition - 1
            }

            return stdout.cursorTo(cursorPosition);

        } else if (key.name === 'right') {

            const newPosition = cursorPosition === null ? 0 : cursorPosition + 1;

            if (newPosition > command.length) {
                cursorPosition = 0
            } else {
                cursorPosition = newPosition;
            }

            return stdout.cursorTo(cursorPosition);
        } else if (key.name === 'backspace') {
            if (isEditorMode) {
                if (insideBracket.length) {
                    let newPosition;
                    if (cursorPosition === null) {
                        newPosition = insideBracket.length - 1
                    } else {
                        newPosition = cursorPosition - 1
                    }

                    if (newPosition === 0 && insideBracket.length === 1) {
                        insideBracket = '';
                        stdout.clearLine();
                        cursorPosition = 0;
                        return stdout.cursorTo(cursorPosition);
                    }

                    insideBracket = insideBracket.split('');
                    insideBracket.splice(newPosition, 1);
                    insideBracket = insideBracket.join('');

                    // $.log(insideBracket);

                    stdout.clearLine();
                    stdout.cursorTo(0);
                    stdout.write(insideBracket);
                    cursorPosition = newPosition;
                    return stdout.cursorTo(cursorPosition);
                }
            } else if (command.length) {
                let newPosition;

                if (cursorPosition === null) {
                    newPosition = command.length - 1
                } else {
                    newPosition = cursorPosition - 1
                }

                if (newPosition === 0 && command.length === 1) {
                    command = '';
                    stdout.clearLine();
                    cursorPosition = 0;
                    return stdout.cursorTo(cursorPosition);
                }

                command = command.split('');
                command.splice(newPosition, 1);
                command = command.join('');

                // $.log(command);

                stdout.clearLine();
                stdout.cursorTo(0);
                stdout.write(command);
                cursorPosition = newPosition;
                return stdout.cursorTo(cursorPosition);
            }
        } else if (key.ctrl && key.name === 'c') {

            return $.logAndExit("Bye!");

        } else if (key.name === 'return') {
            let useEol = false;
            if (isEditorMode) {
                command += insideBracket;
                insideBracket = '';

                if (command.substr(command.length - 2) === '}/') {
                    command = command.substr(0, command.length - 1);
                    setEditorMode(false);
                    return handleCommand();
                } else {
                    useEol = true;
                }
            }

            console.log();
            if (useEol || command.trim().substr(command.length - 1) === '{') {
                return addToCommand('eol');
            } else {
                return handleCommand();
            }

        } else {

            const name = key.sequence.length === 1 ? key.sequence : key.name;
            return addToCommand(name);
        }
    } else {
        return addToCommand(ch);
    }
});