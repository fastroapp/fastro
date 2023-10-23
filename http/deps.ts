import { renderToString as rtsProd } from "https://esm.sh/v133/react-dom@18.2.0/server";
import { renderToString as rtsDev } from "https://esm.sh/v133/react-dom@18.2.0/server?dev";
const renderToString = Deno.env.get("ENV") === "DEVELOPMENT" ? rtsDev : rtsProd;
export { renderToString };

export { toHashString } from "https://deno.land/std@0.204.0/crypto/to_hash_string.ts";
export {
  Status,
  STATUS_TEXT,
} from "https://deno.land/std@0.204.0/http/http_status.ts";
export * from "https://deno.land/std@0.204.0/media_types/mod.ts";
export * from "https://deno.land/std@0.204.0/path/mod.ts";

export type {
  ConnInfo,
  Handler,
} from "https://deno.land/std@0.204.0/http/server.ts";
