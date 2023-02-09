import application from "$fastro/server/mod.ts";

const app = application({ flash: true });

app.get("/", () => new Response("Hello flash"));

await app.serve();
