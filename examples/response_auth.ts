import application, { response } from "../server/mod.ts"

const app = application()

app.get("/", () => {
    return response()
        .authorization("Basic YWxhZGRpbjpvcGVuc2VzYW1l")
        .send("Basic auth")
})

console.log("Listening on: http://localhost:8000")

await app.serve()
