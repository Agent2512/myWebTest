import Elysia from "elysia";
import * as elements from "typed-html";
import { HTML } from "../server";

export const indexApp = new Elysia()
    .get("/", () => page())



const page = () => (
    <HTML>
        <body class="bg-gray-800 w-full h-screen grid grid-cols-1 lg:grid-cols-[4fr_1.25fr] grid-rows-[1fr_5fr]">
            <div id="inputs" class="flex justify-center items-center row-span-1 p-3">
                <form
                    class="h-full w-full bg-slate-500 rounded grid grid-cols-[2fr_2fr_1fr]"
                    hx-post="/api/chat/joinChatroom"
                    hx-target="#chatroom"
                    hx-swap="outerHTML"
                >

                    <div class="flex flex-col m-auto w-3/4">
                        <label>username</label>
                        <input type="text" name="username" id="username" required="" autofocus="true" />
                    </div>

                    <div class="flex flex-col m-auto w-3/4">
                        <label>channel</label>
                        <input type="text" name="channel" id="channel" required="" value="main" />
                    </div>

                    <button type="submit" class="bg-green-500 rounded aspect-square w-24 m-auto">connect</button>
                </form>
            </div>
            <div class="hidden lg:block row-span-2 p-3">
                <div class="h-full w-full bg-slate-500 rounded">
                    <div class="border-solid border-b-4 border-gray-800">
                        <p class="text-3xl text-center">Users</p>
                    </div>
                    <div id="users" />
                </div>
            </div>
            <div class="p-3">
                <div id="chatroom" class="h-full w-full bg-slate-500 rounded" />
            </div>
        </body>
    </HTML>
)

