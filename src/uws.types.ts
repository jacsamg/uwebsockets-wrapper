import {
  HttpRequest,
  HttpResponse
} from "uWebSockets.js";
import { UwsServerRouter } from "./uws-router.class";

export enum UrlMethod {
  get = "get",
  post = "post"
}

export interface RouteLeaf {
  method: UrlMethod;
  url: string;
}

export type UwsHandler = (req: HttpRequest, res: HttpResponse) => void | Promise<void>;
export type UwsErrorHandlerResponse = { success: false; errorMessage: string; };
export type UwsErrorHandler = (error: any) => UwsErrorHandlerResponse | Promise<UwsErrorHandlerResponse>;
export type UwsAbortedHandler = (data?: any) => void | Promise<void>;
export type UwsMiddleware = (req: HttpRequest, res: HttpResponse) => boolean | Promise<boolean>;
export type RouterFactory = () => UwsServerRouter | Promise<UwsServerRouter>;

export interface UwsServerRouteConfig {
  route: RouteLeaf;
  handler: UwsHandler;
  errorHandler?: UwsErrorHandler;
  abortedHandler?: UwsAbortedHandler;
  middleware?: UwsMiddleware[];
}