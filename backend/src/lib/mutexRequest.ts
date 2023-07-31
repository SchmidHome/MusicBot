import { ConsoleLogger } from "./logger";

export class mutexRequest<F extends (...args: any) => Promise<any>> {
  constructor(
    private readonly logger: ConsoleLogger,
    private readonly name: string,
    private readonly func: F
  ) {}

  private resolver: Promise<ReturnType<F>> | undefined;
  //@ts-expect-error
  public async execute(...args: Parameters<F>): ReturnType<F> {
    if (this.resolver) {
      this.logger.debug(`${this.name}(): waiting for previous request`);
      return this.resolver;
    }
    let start = Date.now();
    this.resolver = this.func(args);
    return this.resolver.finally(()=>{
        this.resolver = undefined;
        this.logger.log(`${this.name}(): ${Date.now() - start}ms`);
    })
    
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
