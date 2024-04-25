import {
  App,
  AppOptions,
  TemplatedApp,
  us_listen_socket
} from "uWebSockets.js";
import { RouterFactory, UwsMiddleware } from "./uws.types";
import { formatUrlToDisplay } from './uws.utilities';

export class UwsServerService {
  private readonly globalMiddlewares: UwsMiddleware[] = [];
  private boostraped: boolean = false;
  private defaultListenCallback = (listenSocket: us_listen_socket | false) => undefined;
  private app!: TemplatedApp;

  constructor() { }

  public __init(uWSConfig: AppOptions = {}) {
    this.app = App(uWSConfig);

    console.info(UwsServerService.name);
  }

  public __open(
    port: number,
    callback: (listenSocket: us_listen_socket | false) => void | Promise<void> = this.defaultListenCallback
  ): void {
    if (this.boostraped) return;

    this.boostraped = true;

    this.app.listen(port, callback);
    console.info(`${UwsServerService.name}: listening in port ${port}`);
  }

  public __close(): void {
    if (this.boostraped) {
      this.app.close();
      this.boostraped = false;
      console.info(UwsServerService.name);
    }
  }

  public addGlobalMiddleware(globalMiddleware: UwsMiddleware): void {
    this.globalMiddlewares.push(globalMiddleware);
    console.info(`${UwsServerService.name}: middleware added ${globalMiddleware.name}`);
  }

  public async addRouter(routerFactory: RouterFactory): Promise<void> {
    const router = await Promise.resolve(routerFactory());

    console.info(`UwsService: [added ${formatUrlToDisplay(router.routerPath)}]`);
    router.addGlobalMiddlewares(this.globalMiddlewares);
    router.__init(this.app);
  }
}
