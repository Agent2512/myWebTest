import Elysia, { t } from "elysia";
import * as elements from "typed-html";

type Tuser = {
    username: string,
    socket: string,
}

type Tmessage = {
    user: Tuser,
    message: string,
    system: boolean,
}

type Tchannel = {
    name: string,
    users: Tuser[],
    messages: Tmessage[],
}

let channels: Tchannel[] = [];

const getID = (id: string | null) => {
    if (!id) return "";

    return id
        .replaceAll("/", "")
        .replaceAll("+", "")
        .replaceAll("-", "")
        .replaceAll("=", "")
}



const app = new Elysia({
    prefix: "/api/chat",
})
    .post("/joinChatroom", (con) => {
        const body = con.body


        return chatRoom({
            username: body.username,
            channel: body.channel,
        });
    },
        {
            body: t.Object({
                username: t.String(),
                channel: t.String(),
            })
        }
    )
    .ws("/chatroom", {
        open(ws) {
            const id = getID(ws.data.headers["sec-websocket-key"])
            // console.log("open", id);

            const data = ws.data.query

            // make user
            const user: Tuser = {
                username: data.username,
                socket: id,
            }

            // get channel
            const channel = channels.find(p => p.name === data.channel)
            if (!channel) {
                channels.push({
                    name: data.channel,
                    users: [user],
                    messages: [{ user: user, message: "joined", system: true }],
                })

                // ws.raw.sendText((<p id="id" class={`hidden id-${id}`} />).toString())
                ws.raw.sendText(renderStyle(id))

                ws.subscribe(data.channel)

                ws.publish(data.channel, renderChat(data.channel))
                ws.raw.sendText(renderChat(data.channel))
            }
            else {
                channel.users.push(user)
                channel.messages.push({ user: user, message: "joined", system: true })

                // ws.raw.sendText((<p id="id" class={`hidden id-${id}`} />).toString())
                ws.raw.sendText(renderStyle(id))

                ws.subscribe(channel.name)

                ws.raw.publishText(channel.name, renderChat(channel.name))

                setTimeout(() => {
                    ws.raw.sendText(renderChat(channel.name))
                }, 100)
            }
        },
        message(ws, { message }) {
            const id = getID(ws.data.headers["sec-websocket-key"])

            const data = ws.data.query
            const channel = channels.find(p => p.name === data.channel)
            if (!channel) return;

            const user = channel.users.find(p => p.socket === id)

            if (!user) return;

            channel.messages.push({ user: user, message: message, system: false })

            ws.raw.publishText(channel.name, renderChat(channel.name))
            ws.raw.sendText(renderChat(channel.name))
        },
        body: t.Object({
            message: t.String(),
            HEADERS: t.Any()
        }),
        query: t.Object({
            username: t.String(),
            channel: t.String(),
        }),

    })



const renderStyle = (id: string, size?: string) => {
    return (
        <style id="websocketstyle">
            {`.id-${id} {`}
            margin-left: auto;
            background-color: rgb(134 239 172 / var(--tw-bg-opacity));
            border-color: rgb(22 163 74 / var(--tw-border-opacity));
            {`}`}

            {`#chat {`}
            height: {`${size || "100%"}`};
            {`}`}
        </style>
    ).toString()
}

const renderChat = (channelName: string) => {
    const channel = channels.find(p => p.name === channelName)

    if (!channel) {
        return (
            <div id="chat">
                error
            </div>
        ).toString()
    }
    else {
        return (
            <div id="chat" class="p-2 overflow-auto">
                {channel.messages.map(message)}
            </div>
        ).toString()
    }
}

const message = (m: Tmessage) => {
    if (m.system) {
        return (
            <div class={`id-${m.user.socket} rounded-full bg-gray-300 h-fit w-fit border-solid border-2 border-gray-600 mb-2 mx-auto`}>
                <p class="w-fit pt-2 px-5">{m.user.username}:</p>
                <p class="w-fit pb-2 px-8">{m.message}</p>
            </div>
        )
    }

    return (
        <div class={`id-${m.user.socket} rounded-full bg-blue-300 h-fit w-fit border-solid border-2 border-blue-600 mb-2`}>
            <p class="w-fit pt-2 px-5">{m.user.username}:</p>
            <p class="w-fit pb-2 px-8">{m.message}</p>
        </div>
    )
}

const chatRoom = (p: { username: string, channel: string }) => (
    <div
        id="chatroom"
        class={`h-full w-full bg-slate-500 rounded grid grid-rows-[6fr_1fr]`}
        hx-ext="ws" ws-connect={`ws://localhost:3000/api/chat/chatroom?channel=${p.channel}&username=${p.username}`}

    >
        <p id="id" class="hidden" />
        <div id="chat" />

        <form id="form" ws-send class="w-full h-full grid grid-cols-[5fr_1fr]">
            <textarea name="message" class="rounded-bl resize-none" autofocus="true" />
            <button type="submit" class="bg-green-500 rounded-br">send</button>
        </form>
        <script src="/scripts/chatScript.js" />
    </div>
)

export const chatApp = new Elysia()
    .get("/scripts/chatScript.js", () => Bun.file("./src/scripts/chatScript.js"))
    .use(app)

