import { Buffer } from 'node:buffer';
import { HttpRequest, HttpResponse } from "uWebSockets.js";
import { INVALID_JSON_BODY_ERROR } from "./uws.data";

export function getJsonBody<T>(req: HttpRequest, res: HttpResponse): Promise<T> {
  return new Promise((resolve, reject) => {
    let buffer: Buffer;

    if (req.getHeader("content-type") !== "application/json") {
      return reject(new Error(INVALID_JSON_BODY_ERROR));
    }

    res.onData((chuckRaw: ArrayBuffer, lastChunk: boolean) => {
      try {
        const chunk = Buffer.from(chuckRaw);

        if (lastChunk) {
          if (buffer) {
            const bodyRaw = Buffer.concat([buffer, chunk]);
            const json = JSON.parse(bodyRaw.toString());

            return resolve(json);
          }

          if (chunk.byteLength) {
            return resolve(JSON.parse(chunk.toString()));
          }

          return reject(new Error(INVALID_JSON_BODY_ERROR));
        } else {
          if (buffer) buffer = Buffer.concat([buffer, chunk]);
          else buffer = Buffer.concat([chunk]);
        }
      } catch (error: any) {
        reject(error);
      }
    });
  });
};

export function getQueries(queryString: string): Record<any, any> {
  const searchParams = new URLSearchParams(queryString);
  const queries: Record<string, string> = {};

  for (let query of searchParams.entries()) {
    queries[query[0]] = query[1];
  }

  return queries;
}

export function sendJson(res: HttpResponse, jsonContent: Record<any, any>): void {
  res.cork(() => {
    res.writeHeader("content-type", "application/json");
    res.end(JSON.stringify(jsonContent));
  });
}

export function endWithoutBody(res: HttpResponse, statusCode: string): void {
  res.cork(() => {
    res.writeStatus(statusCode);
    res.endWithoutBody();
  });
}

export function formatHttpMethodToDisplay(value: string): string {
  if (value.length === 4) return value;
  else if (value.length === 3) return value + " ";
  return value;
}

export function formatUrlToDisplay(url: string): string {
  return url.slice(1);
}
