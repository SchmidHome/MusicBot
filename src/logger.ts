import chalk, { Chalk } from "chalk"
import { Logger } from "ts-log"

export class ConsoleLogger implements Logger {
    public static colors: Chalk[] = [
        // chalk.blueBright,
        // chalk.greenBright,
        // chalk.yellowBright,
        // chalk.magentaBright,
        // chalk.cyanBright,
        // chalk.whiteBright,
        chalk.cyan,
        chalk.magenta,
        chalk.green,
        chalk.black,
        // chalk.blackBright,
        // chalk.redBright,
        chalk.red,
        chalk.yellow,
        chalk.blue,
        chalk.white,
    ]
    static maxNameLength = 0

    color: Chalk
    public constructor(private name: string) {
        // select a foreground color and remove it from the list
        this.color = ConsoleLogger.colors.shift() || chalk.whiteBright
        ConsoleLogger.maxNameLength = Math.max(ConsoleLogger.maxNameLength, name.length)
    }

    public trace(message?: any, ...optionalParams: any[]): void {
        this.append("TRACE", chalk.cyan, chalk.white, message, ...optionalParams)
    }

    public debug(message?: any, ...optionalParams: any[]): void {
        this.append("DEBUG", chalk.cyan, chalk.white, message, ...optionalParams)
    }


    public log: (message?: any, ...optionalParams: any[]) => void = this.info;
    public info(message?: any, ...optionalParams: any[]): void {
        this.append("INFO ", chalk.blue, chalk.white, message, ...optionalParams)
    }

    public warn(message?: any, ...optionalParams: any[]): void {
        this.append("WARN ", chalk.yellow, chalk.yellow, message, ...optionalParams)
    }

    public error(message?: any, ...optionalParams: any[]): void {
        this.append("ERROR", chalk.red, chalk.red, message, ...optionalParams)
    }

    private append(type: string, colorType: Chalk, colorText: Chalk, message: string, ...optionalParams: any[]) {
        console.log(`[${colorType(type)}] [${this.color(this.name.padEnd(ConsoleLogger.maxNameLength))}] ${colorText(message)}`, ...optionalParams)
    }
}

