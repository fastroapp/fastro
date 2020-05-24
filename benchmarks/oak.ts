import { Application } from "https://deno.land/x/oak/mod.ts";

const app = new Application();
const port = 3003;

app.use((ctx) => {
  ctx.response.body = "Hello!";
});

console.log("oak listening on:", port);
await app.listen({ port });
