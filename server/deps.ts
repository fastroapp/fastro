export { Status, STATUS_TEXT } from "$std/http/http_status.ts";
export { serve, Server } from "$std/http/server.ts";
export type { ConnInfo, ServeInit } from "$std/http/server.ts";
export { h, ReactDOMServer };

// @deno-types="https://cdn.esm.sh/v78/@types/react@18.0.9/react.d.ts"
import ReactDOMServer from "https://esm.sh/react-dom@18.2.0/server";
import { createElement as h } from "https://esm.sh/react@18.2.0";
