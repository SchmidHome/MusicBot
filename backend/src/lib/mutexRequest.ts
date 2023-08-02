import chalk from "chalk";
import { ConsoleLogger } from "./logger";

export class mutexRequest<F extends (...args: any) => Promise<any>> {
  constructor(
    private readonly logger: ConsoleLogger,
    private readonly name: string,
    private readonly requestInterval_ms: number,
    private readonly func: F
  ) {}

  private resolver: Promise<ReturnType<F>> | undefined;

  lastRes: { time: number; res: ReturnType<F> } | undefined;
  public async execute(
    priority: boolean,
    ...args: Parameters<F>
  ): // @ts-expect-error
  ReturnType<F> {
    if (this.resolver) {
      this.logger.debug(`${this.name}() ${chalk.yellow("waiting")}`);
      return this.resolver;
    }

    if (
      this.lastRes &&
      Date.now() - this.lastRes.time <
        this.requestInterval_ms / (priority ? 4 : 1)
    ) {
      this.logger.debug(`${this.name}() ${chalk.gray("cached")}`);
      return this.lastRes.res;
    }

    let start = Date.now();
    this.resolver = this.func(args);
    return this.resolver
      .then((res) => {
        this.resolver = undefined;
        this.lastRes = { time: Date.now(), res };
        this.logger.log(
          `${this.name}(): ${chalk.green("OK")} ${Date.now() - start}ms`
        );
        return res;
      })
      .catch((error) => {
        this.resolver = undefined;
        this.logger.warn(
          `${this.name}(): ${chalk.red("ERR")} ${Date.now() - start}ms`
        );
        throw error;
      });

    // try {
    //     const res = await this.resolver;
    //     this.resolver = undefined;
    //     this.logger.log(`${this.name}(): OK ${Date.now() - start}ms`);
    //     return res;
    // } catch (error) {
    //     this.resolver = undefined;
    //     this.logger.warn(`${this.name}():ERR ${Date.now() - start}ms`);
    //     throw error;
    // }
  }
}
