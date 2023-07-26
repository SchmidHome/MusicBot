import chalk, { Chalk } from "chalk"
import { appendFile, fstat, writeFile } from "fs"
import { Logger } from "ts-log"

function padCenter(str: string, len: number) {
    return str.padStart(str.length + Math.floor((len - str.length) / 2)).padEnd(len)
}

export class ConsoleLogger implements Logger {
    public static colors: Chalk[] = [
        chalk.cyan,
        chalk.magenta,
        chalk.green,
        chalk.black,
        chalk.red,
        chalk.yellow,
        chalk.blue,
        chalk.white,
    ]
    static maxNameLength = 0

    public getTime(): string {
        // LOCALE HH:MM:SS.mmm
        return new Date().toLocaleTimeString() + "." + new Date().getMilliseconds().toString().padStart(3, "0")
    }

    public readonly filename: string
    public readonly color: Chalk
    public constructor(private name: string) {
        // select a foreground color and remove it from the list
        this.color = ConsoleLogger.colors.shift() || chalk.whiteBright
        ConsoleLogger.maxNameLength = Math.max(ConsoleLogger.maxNameLength, name.length)
        this.filename = `logs/${name}.ans`
        appendFile(this.filename, "\n\nSTARTED " + this.getTime() + "\n", () => { })
    }

    public trace(message?: any, ...optionalParams: any[]): void {
        this.append("TRACE", chalk.cyan, chalk.white, message, ...optionalParams)
    }

    public debug(message?: any, ...optionalParams: any[]): void {
        this.append("DEBUG", chalk.cyan, chalk.white, message, ...optionalParams)
    }

    public log: (message?: any, ...optionalParams: any[]) => void = this.info;
    public info(message?: any, ...optionalParams: any[]): void {
        this.append(" LOG ", chalk.blue, chalk.white, message, ...optionalParams)
    }

    public warn(message?: any, ...optionalParams: any[]): void {
        this.append("WARN ", chalk.yellow, chalk.yellow, message, ...optionalParams)
    }

    public error(message?: any, ...optionalParams: any[]): void {
        this.append("ERROR", chalk.red, chalk.red, message, ...optionalParams)
    }

    private append(type: string, colorType: Chalk, colorText: Chalk, message: string, ...optionalParams: any[]) {
        const msg = `[${this.getTime()}] [${colorType(type)}] [${this.color(padCenter(this.name, ConsoleLogger.maxNameLength))}] ${colorText(message)}`
        console.log(msg, ...optionalParams)
        const params = JSON.stringify(optionalParams)
        appendFile(this.filename, msg + (
            params === "[]" ? "" : " " + params
        ) + "\n", () => { })
    }
}
