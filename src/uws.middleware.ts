import { HttpRequest, HttpResponse } from "uWebSockets.js";
import { UwsMiddleware } from "./uws.types";

function loadRequestCommonHeadersMiddleware(req: HttpRequest, res: HttpResponse, reqHeaderKeys: string[]): boolean {
  const reqHeaders: Record<string, string> = {};
  reqHeaders["content-type"] = req.getHeader("content-type");

  for (const reqHeaderKey of reqHeaderKeys) {
    const key = reqHeaderKey.toLowerCase();
    reqHeaders[key] = req.getHeader(key);
  }

  res.reqHeaders = reqHeaders;

  return true;
}


export function loadRequestCommonHeadersMwFactory(...reqHeaderKeys: string[]): UwsMiddleware {
  return (req: HttpRequest, res: HttpResponse) => loadRequestCommonHeadersMiddleware(req, res, reqHeaderKeys);
}
