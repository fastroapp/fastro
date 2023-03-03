// deno-lint-ignore-file no-explicit-any
import { CACHE, NONPAGE } from "./constant.ts";
import { ReactDOMServer } from "./deps.ts";
import { handleJSXPage } from "./page.ts";
import { response } from "./response.ts";
import { handleStaticFile } from "./static.ts";
import {
  Container,
  ExecHandler,
  HandlerArgument,
  HttpRequest,
  MiddlewareArgument,
  RequestHandler,
  Route,
  Row,
  SetOptions,
  SSRHandler,
} from "./types.ts";

export function createHandler(
  middlewares: Array<MiddlewareArgument>,
  routes: Array<Route>,
  pages: Array<SSRHandler>,
  staticURL: string,
  container: Container,
  maxAge: number,
) {
  let cache: Row = {};
  return function (r: Request) {
    cache = <Row> container.get(CACHE);
    let handler: HandlerArgument | undefined = undefined;
    if (middlewares.length > 0) {
      handler = handleMiddleware(r, middlewares);
      if (handler) {
        const h = <RequestHandler> handler;
        return h(transformRequest(r, container, null), response(r), undefined);
      }
    }
    return handleRoutes(r);
  };

  function handlePages(r: Request, id: string) {
    let page: SSRHandler | undefined | null = undefined;
    let match: URLPatternResult | null = null;
    const pageId = `page-${id}`;
    const matchId = `match-${pageId}`;

    if (cache[pageId]) {
      page = cache[pageId] === NONPAGE ? undefined : cache[pageId];
      if (cache[matchId]) match = cache[matchId];
    } else {
      const p = pages.find((page) => {
        let pattern: URLPattern | null = new URLPattern({
          pathname: page.path,
        });
        const m = pattern.exec(r.url);
        pattern = null;
        if (m) {
          match = m;
          cache[matchId] = m;
          return (m);
        }
      });
      cache[pageId] = p ? p : NONPAGE;
      page = p;
    }

    if (!page) {
      return handleStaticFile(r.url, staticURL, maxAge);
    }

    return handleJSXPage(
      page,
      transformRequest(r, container, match),
      container,
    );
  }

  function handleRoutes(r: Request) {
    const id = `${r.method}-${r.url}`;
    const paramId = `param-${id}`;
    let handler: HandlerArgument | undefined | null = undefined;
    let match: URLPatternResult | null = null;

    if (cache[id]) {
      handler = cache[id];
      if (cache[paramId]) match = cache[paramId];
    } else {
      routes.find((route) => {
        let pattern: URLPattern | null = new URLPattern({
          pathname: route.path,
        });
        const m = pattern.exec(r.url);
        pattern = null;
        if (m) {
          match = m;
          handler = route?.handler;
          return (route.method === r.method);
        }
      });
    }

    if (!handler) return handlePages(r, id);

    cache[id] = handler;
    cache[paramId] = match;
    const execHandler = <ExecHandler> <unknown> handler;
    const result = execHandler(
      transformRequest(r, container, match),
      response(r),
      undefined,
    );

    if (isString(result)) return new Response(result);

    if (isResponse(result)) return <Response> <unknown> result;

    if (isJSX(result)) return render(<JSX.Element> <unknown> result);

    const [isJson, object] = isJSON(result);
    if (isJson) {
      const headers = new Headers();
      headers.set("content-type", "application/json");
      return new Response(<string> object, { headers });
    }

    return new Response(result);
  }

  function handleMiddleware(
    r: Request,
    middlewares: Array<MiddlewareArgument>,
  ) {
    let done = false;
    let handler: HandlerArgument | undefined = undefined;
    for (let index = 0; index < middlewares.length; index++) {
      const m = middlewares[index];
      const res = response(r);
      m(transformRequest(r, container), res, (err) => {
        if (err) throw err;
        done = true;
      });

      if (!done) {
        handler = <HandlerArgument> m;
        break;
      }
    }

    return handler;
  }
}

function isString(stringResult: any) {
  return stringResult.startsWith != undefined;
}

function isResponse(element: unknown) {
  return element instanceof Response;
}

function isJSON(element: unknown) {
  if (element instanceof Promise) return [false, ""];
  let stringify;
  let str = "";
  try {
    str = <string> element;
    stringify = JSON.stringify(str);
    JSON.parse(stringify);
  } catch {
    return [false, ""];
  }
  return [true, stringify];
}

export function isJSX(element: unknown) {
  const el = <JSX.Element> element;
  return el.props != undefined && el.type != undefined;
}

function render(element: JSX.Element) {
  const component = ReactDOMServer.renderToString(element);
  return new Response(component, {
    headers: {
      "content-type": "text/html",
    },
  });
}

export function transformRequest(
  r: Request,
  container: Container,
  match?: URLPatternResult | null,
) {
  const req = <HttpRequest> r;
  if (!match) {
    req.match = null;
    return req;
  }
  req.container = () => container;
  req.match = match;
  req.get = <T>(key: string) => {
    return <T> container.get(key);
  };
  req.set = <T>(key: string, value: T, options?: SetOptions) => {
    return container.set(key, value, options);
  };
  req.delete = (key: string) => {
    return container.delete(key);
  };
  return req;
}
