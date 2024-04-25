import {
  HttpRequest,
  HttpResponse,
} from "uWebSockets.js";
import {
  UwsAbortedHandler,
  UwsErrorHandler,
  UwsErrorHandlerResponse,
  UwsMiddleware,
  UwsServerRouteConfig
} from "./uws.types";

export class UwsServerRoute {
  private readonly allMiddlewares: UwsMiddleware[] = [];
  private readonly globalMiddlewares: UwsMiddleware[] = [];
  private readonly routerMiddlewares: UwsMiddleware[] = [];
  private readonly routeMiddlewares: UwsMiddleware[] = [];
  private bootstraped: boolean = false;

  public get method() { return this.config.route.method; };
  public get url() { return this.config.route.url; };

  constructor(private readonly config: UwsServerRouteConfig) { }

  public __init() {
    if (this.bootstraped) return;

    this.allMiddlewares.push(
      ...this.globalMiddlewares,
      ...this.routerMiddlewares,
      ...(this.config.middleware || []),
      ...this.routeMiddlewares
    );

    this.bootstraped = true;
  }

  public addGlobalMiddlewares(globalMiddlewares: UwsMiddleware[]) {
    if (this.bootstraped) return;
    this.globalMiddlewares.push(...globalMiddlewares);
  }

  public addRouterMiddlewares(routerMiddlewares: UwsMiddleware[]) {
    if (this.bootstraped) return;
    this.routerMiddlewares.push(...routerMiddlewares);
  }

  public addRouteMiddlewares(routeMiddlewares: UwsMiddleware[]) {
    if (this.bootstraped) return;
    this.routeMiddlewares.push(...routeMiddlewares);
  }

  private async defaultAbortedHandler(res: HttpResponse, abortedHandler?: UwsAbortedHandler): Promise<void> {
    try {
      console.info(`UwsRoute, ${this.defaultAbortedHandler.name}:`, "Aborted request");
      if (abortedHandler) await Promise.resolve(abortedHandler());
    } catch (error: any) {
      console.error(`UwsRoute, ${this.defaultAbortedHandler.name}:`, error);
    }
  }

  private async defaultErrorHandler(res: HttpResponse, error: any, errorHandler?: UwsErrorHandler): Promise<void> {
    try {
      let errorResponse: UwsErrorHandlerResponse = {
        success: false,
        errorMessage: error?.message || error
      };

      if (errorHandler) {
        errorResponse = await Promise.resolve(errorHandler(error));
      }

      console.info(`UwsRoute, ${this.defaultErrorHandler.name}:`, errorResponse.errorMessage);
      console.error(error);
      res.cork(() => {
        res.writeStatus("500");
        res.end(JSON.stringify(errorResponse));
      });
    } catch (error: any) {
      console.info(`UwsRoute, ${this.defaultErrorHandler.name}:`, error);
    }
  }

  public async handler(res: HttpResponse, req: HttpRequest): Promise<void> {
    res.onAborted(async () => await this.defaultAbortedHandler(res, this.config.abortedHandler));

    try {
      let next = true;

      if (this.allMiddlewares.length) {
        for (const middleware of this.allMiddlewares) {
          next = await Promise.resolve(middleware(req, res));
          if (!next) break;
        }
      }

      if (next) await Promise.resolve(this.config.handler(req, res));
    } catch (error: any) {
      await Promise.resolve(this.defaultErrorHandler(res, error, this.config.errorHandler));
    }
  }
}
