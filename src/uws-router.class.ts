import {
  TemplatedApp
} from "uWebSockets.js";
import {
  UrlMethod,
  UwsMiddleware,
  UwsServerRouteConfig
} from "./uws.types";
import { UwsServerRoute } from "./uws-route.class";
import { formatHttpMethodToDisplay, formatUrlToDisplay } from './uws.utilities';

export class UwsServerRouter {
  private readonly routes: UwsServerRoute[] = [];
  private readonly globalMiddlewares: UwsMiddleware[] = [];
  private readonly routerMiddlewares: UwsMiddleware[] = [];
  private bootstraped: boolean = false;
  private _routerPath: string = "";

  public get routerPath() { return this._routerPath; }

  constructor() { }

  public __init(app: TemplatedApp): void {
    if (this.bootstraped) return;

    for (const route of this.routes) {
      const url = this.routerPath + route.url;

      route.__init();

      switch (route.method) {
        case UrlMethod.get:
          app.get(url, route.handler.bind(route));
          break;
        case UrlMethod.post:
          app.post(url, route.handler.bind(route));
          break;
        case <any>'any':
          app.any(url, route.handler.bind(route));
          break;
      }

      console.info(`UwsRouter : + ${formatHttpMethodToDisplay(route.method)} ${formatUrlToDisplay(url)}`);
    }

    this.bootstraped = true;
  }

  public addRouterPath(path: string): void {
    if (this.bootstraped) return;
    this._routerPath = path;
  }

  public addGlobalMiddlewares(globalMiddlewares: UwsMiddleware[]): void {
    if (this.bootstraped) return;
    this.globalMiddlewares.push(...globalMiddlewares);
  }

  public addRouterMiddleware(middleware: UwsMiddleware): void {
    if (this.bootstraped) return;
    this.routerMiddlewares.push(middleware);
  }

  public addRoute(route: UwsServerRoute): void {
    if (this.bootstraped) return;

    route.addGlobalMiddlewares(this.globalMiddlewares);
    route.addRouterMiddlewares(this.routerMiddlewares);
    this.routes.push(route);
  }

  public makeRoutes(...routesConfig: UwsServerRouteConfig[]): void {
    if (this.bootstraped) return;

    for (const routeConfig of routesConfig) {
      this.addRoute(new UwsServerRoute(routeConfig));
    }
  }
}
