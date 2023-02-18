import { DELETE, GET, OPTIONS, PATCH, POST } from "./constant.ts";
import { ServeInit, Server } from "./deps.ts";
import { createHandler } from "./handler.ts";
import {
  Fastro,
  HandlerArgument,
  MiddlewareArgument,
  Route,
  SSR,
  SSRHandler,
  StartOptions,
} from "./types.ts";

export function fastro(_startOptions?: StartOptions): Fastro {
  const routes: Array<Route> = [];
  const pages: Array<SSRHandler> = [];
  const middlewares: Array<MiddlewareArgument> = [];
  const ac = new AbortController();
  let staticFolder = "./public";
  let staticPath = "/";
  let flash = false;
  let server: Server;

  function push(method: string, path: string, handler: HandlerArgument) {
    const r = { method, path, handler };
    const res = routes.find((val) => (val === r));
    if (!res) routes.push(r);
    return app;
  }

  const app = {
    serve: (serveOptions: ServeInit) => {
      const hostname = serveOptions?.hostname || "127.0.0.1";
      const port = serveOptions?.port || 9000;
      const baseUrl = `http://${hostname}:${port}`;
      const baseStaticPath = `${baseUrl}${staticPath}`;
      const cache = {};

      for (const p of pages) {
        const rootComponent = `App`;
        const bundle = p.ssr._getBundleName();
        const rootTSX = bundle;
        p.ssr._createBundle(bundle, rootComponent, rootTSX);
      }

      const handler = createHandler(
        middlewares,
        routes,
        pages,
        baseStaticPath,
        staticFolder,
        cache,
      );

      if (!flash) {
        return Deno.serve({
          hostname,
          port,
          handler,
          onListen: serveOptions?.onListen,
          onError: serveOptions?.onError,
          signal: ac.signal,
        });
      }

      const s = new Server({
        onError: serveOptions?.onError,
        hostname: hostname,
        port,
        handler,
      });

      return s.listenAndServe();
    },
    static: (path: string, folder?: string) => {
      staticPath = path;
      if (folder) staticFolder = folder;
      return app;
    },
    close: () => {
      if (!flash) return ac.abort();
      return server.close();
    },
    use: (...middleware: Array<MiddlewareArgument>) => {
      middleware.forEach((m) => {
        middlewares.push(m);
      });
      return app;
    },
    get: (path: string, handler: HandlerArgument) => {
      return push(GET, path, handler);
    },
    post: (path: string, handler: HandlerArgument) => {
      return push(POST, path, handler);
    },
    put: (path: string, handler: HandlerArgument) => {
      return push(POST, path, handler);
    },
    delete: (path: string, handler: HandlerArgument) => {
      return push(DELETE, path, handler);
    },
    patch: (path: string, handler: HandlerArgument) => {
      return push(PATCH, path, handler);
    },
    options: (path: string, handler: HandlerArgument) => {
      return push(OPTIONS, path, handler);
    },
    page: (
      path: string,
      ssr: SSR,
      handler: HandlerArgument,
    ) => {
      pages.push({ path, ssr, handler });
      return app;
    },
    flash: (f: boolean) => {
      flash = f;
      return app;
    },
  };
  return app;
}
