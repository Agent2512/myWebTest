import { html as htmlHander } from "@elysiajs/html";
import Elysia from "elysia";
import * as elements from "typed-html";
import { chatApp } from "./api/chat";
import { indexApp } from "./pages";

const app = new Elysia({})
    // .use(swagger())
    .use(htmlHander())
    .use(indexApp)
    .use(chatApp)
    .get("/styles.css", () => Bun.file("./tailwind-gen/styles.css"))
    .get("/script.js", () => Bun.file("./src/script.js"))


app.listen(3000);
console.log("Listening on port 3000");
export type app = typeof app;

let routes: string[] = [
    ...app.routes.map(p => `${p.path} ${p.method} `),
]

routes
    .reduce((acc, cur) => {
        if (acc.indexOf(cur) === -1) {
            acc.push(cur)
        }
        return acc
    }, [] as string[])
    .sort()
    .forEach((route) => {
        console.log(route)
    })

export const HTML = ({ children }: any) => (
    <html lang="en">
        <head>
            <title>Elysia</title>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <script src="https://unpkg.com/htmx.org@1.9.7/dist/htmx.js" />
            <script src="https://unpkg.com/htmx.org/dist/ext/ws.js"></script>

            <link href="/styles.css" rel="stylesheet" />

            <style id="websocketstyle" />
        </head>
        {children}
    </html>
)