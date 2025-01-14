import lib from 'https://bash.ooo/lib.js';
import zhi from 'https://raw.githubusercontent.com/TxThinkingInc/zhi.js/refs/heads/master/lib.js';
import { v4, v7 } from 'uuid';
import path from 'node:path';
import os from 'node:os';
import { $ } from 'bun';

class Bot {
    // chats: [{
    //  ChatUUID: "", // get from https://www.txthinking.com/zhi.html
    //  Key: "", // your Chat Key
    //  UserUUID: "", // get from https://www.txthinking.com/zhi.html
    //  Name: "", // bot name
    //  Avatar: "", // bot avatar, file path
    // }]
    static async init(BotToken, chats) {
        var f = Bun.file(os.homedir() + "/.zhi.bot")
        var j = {}
        if (await f.exists()) {
            j = JSON.parse(await f.text())
        }
        for (var i = 0; i < chats.length; i++) {
            if (j[chats[i].ChatUUID] && j[chats[i].ChatUUID].Avatar == chats[i].Avatar) {
                chats[i].AvatarUUID = j[chats[i].ChatUUID].AvatarUUID
                continue
            }
            var b = await Bun.file(chats[i].Avatar).bytes()
            var res = await fetch(`https://upload.zhi.shiliew.com/?ChatUUID=${chats[i].ChatUUID}&Kind=avatar&Token=${BotToken}`, {
                method: "PUT",
                body: await zhi.encrypt_file(chats[i].Key, chats[i].ChatUUID, chats[i].UserUUID, b),
            })
            if (res.status != 200) {
                throw await res.text()
            }
            chats[i].AvatarUUID = await res.text()
        }
        var cache = {}
        var cs = {}
        chats.forEach(v => {
            cache[v.ChatUUID] = {
                Avatar: v.Avatar,
                AvatarUUID: v.AvatarUUID,
            }
            cs[v.ChatUUID] = {
                Key: v.Key,
                UserUUID: v.UserUUID,
                Name: v.Name,
                AvatarUUID: v.AvatarUUID,
            }
        })
        await Bun.write(os.homedir() + "/.zhi.bot", JSON.stringify(cache));
        return new Bot(BotToken, cs);
    }
    constructor(token, chats) {
        this.token = token
        this.device = v4()
        this.chats = chats
        this.ws = null
    }
    connect() {
        return new Promise((resolve, reject) => {
            var ws = new WebSocket(`wss://api.txthinking.com/im/node/ws?Token=${this.token}&Device=${this.device}`);
            ws.onopen = () => {
                this.ws = ws
                resolve();
            }
            ws.onerror = (error) => reject(error);
        });
    }
    // f(e)
    on_error(f) {
        this.ws.addEventListener("error", e => {
            f(e)
        });
    }
    // f(reason)
    on_close(f) {
        this.ws.addEventListener("close", e => {
            f(e.reason)
        });
    }
    // f(message)
    on_message(f) {
        this.ws.addEventListener("message", async e => {
            var m = JSON.parse(e.data)
            if (!m.Payload) {
                // a message sent successful
                return
            }
            this.ws.send(JSON.stringify({ MessageUUID: m.MessageUUID }))
            var s = await zhi.decrypt_payload(this.chats[m.ChatUUID].Key, m.ChatUUID, m.UserUUID, m.Payload)
            var o = JSON.parse(s)
            delete m.Payload
            f({ ...o, ...m })
        });
    }
    // you should call close if no need bot
    close() {
        this.ws.close()
    }
    async send_text(ChatUUID, text) {
        this.ws.send(JSON.stringify({
            MessageUUID: v7(),
            ChatUUID: ChatUUID,
            UserUUID: this.chats[ChatUUID].UserUUID,
            Payload: await zhi.encrypt_payload(this.chats[ChatUUID].Key, ChatUUID, this.chats[ChatUUID].UserUUID, JSON.stringify({
                Kind: "text",
                Text: text,
                CreatedAt: lib.now(),
                Name: this.chats[ChatUUID].Name,
                AvatarUUID: this.chats[ChatUUID].AvatarUUID,
            })),
        }))
    }
    async send_markdown(ChatUUID, text) {
        this.ws.send(JSON.stringify({
            MessageUUID: v7(),
            ChatUUID: ChatUUID,
            UserUUID: this.chats[ChatUUID].UserUUID,
            Payload: await zhi.encrypt_payload(this.chats[ChatUUID].Key, ChatUUID, this.chats[ChatUUID].UserUUID, JSON.stringify({
                Kind: "markdown",
                Text: text,
                CreatedAt: lib.now(),
                Name: this.chats[ChatUUID].Name,
                AvatarUUID: this.chats[ChatUUID].AvatarUUID,
            })),
        }))
    }
    // file path
    // require: $ nami install ffmpeg
    async send_image(ChatUUID, file) {
        var FileName = path.basename(file)
        var i = FileName.lastIndexOf(".");
        if (i == -1) {
            throw 'The file name is missing a valid extension';
        }
        if (!/^\w+$/.test(FileName.substring(i + 1))) {
            throw 'The file name is missing a valid extension';
        }
        var s = await $`ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=p=0 ${file}`.text()
        var l = s.trim().split(",")
        var b = await Bun.file(file).bytes()
        var res = await fetch(`https://upload.zhi.shiliew.com/?ChatUUID=${ChatUUID}&Kind=image&Token=${this.token}`, {
            method: "PUT",
            body: await zhi.encrypt_file(this.chats[ChatUUID].Key, ChatUUID, this.chats[ChatUUID].UserUUID, b),
        })
        if (res.status != 200) {
            throw await res.text()
        }
        var FileUUID = await res.text()
        this.ws.send(JSON.stringify({
            MessageUUID: v7(),
            ChatUUID: ChatUUID,
            UserUUID: this.chats[ChatUUID].UserUUID,
            Payload: await zhi.encrypt_payload(this.chats[ChatUUID].Key, ChatUUID, this.chats[ChatUUID].UserUUID, JSON.stringify({
                Kind: "image",
                Size: b.length,
                Width: parseInt(l[0]),
                Height: parseInt(l[1]),
                FileName: FileName,
                FileUUID: FileUUID,
                CreatedAt: lib.now(),
                Name: this.chats[ChatUUID].Name,
                AvatarUUID: this.chats[ChatUUID].AvatarUUID,
            })),
        }))
    }
    // file path
    // require: $ nami install ffmpeg
    async send_video(ChatUUID, file) {
        var FileName = path.basename(file)
        var i = FileName.lastIndexOf(".");
        if (i == -1) {
            throw 'The file name is missing a valid extension';
        }
        if (!/^\w+$/.test(FileName.substring(i + 1))) {
            throw 'The file name is missing a valid extension';
        }
        var s = await $`ffprobe -v error -show_entries format=duration -select_streams v:0 -show_entries stream=width,height -of default=noprint_wrappers=1:nokey=1 ${file}`.text()
        var l = s.trim().split("\n")

        var tf = `/tmp/${Date.now()}.jpeg`
        await $`ffmpeg -i ${file} -ss 00:00:00 -vframes 1 -y ${tf} 2>/dev/null`
        var b = await Bun.file(tf).bytes()
        var res = await fetch(`https://upload.zhi.shiliew.com/?ChatUUID=${ChatUUID}&Kind=image&Token=${this.token}`, {
            method: "PUT",
            body: await zhi.encrypt_file(this.chats[ChatUUID].Key, ChatUUID, this.chats[ChatUUID].UserUUID, b),
        })
        if (res.status != 200) {
            throw await res.text()
        }
        var ThumbnailUUID = await res.text()

        var b = await Bun.file(file).bytes()
        var res = await fetch(`https://upload.zhi.shiliew.com/?ChatUUID=${ChatUUID}&Kind=video&Token=${this.token}`, {
            method: "PUT",
            body: await zhi.encrypt_file(this.chats[ChatUUID].Key, ChatUUID, this.chats[ChatUUID].UserUUID, b),
        })
        if (res.status != 200) {
            throw await res.text()
        }
        var FileUUID = await res.text()
        this.ws.send(JSON.stringify({
            MessageUUID: v7(),
            ChatUUID: ChatUUID,
            UserUUID: this.chats[ChatUUID].UserUUID,
            Payload: await zhi.encrypt_payload(this.chats[ChatUUID].Key, ChatUUID, this.chats[ChatUUID].UserUUID, JSON.stringify({
                Kind: "video",
                Size: b.length,
                Width: parseInt(l[0]),
                Height: parseInt(l[1]),
                Duration: parseInt(l[2]),
                FileName: FileName,
                ThumbnailUUID: ThumbnailUUID,
                FileUUID: FileUUID,
                CreatedAt: lib.now(),
                Name: this.chats[ChatUUID].Name,
                AvatarUUID: this.chats[ChatUUID].AvatarUUID,
            })),
        }))
    }
    // file path
    async send_file(ChatUUID, file) {
        var FileName = path.basename(file)
        var i = FileName.lastIndexOf(".");
        if (i == -1) {
            throw 'The file name is missing a valid extension';
        }
        if (!/^\w+$/.test(FileName.substring(i + 1))) {
            throw 'The file name is missing a valid extension';
        }
        var b = await Bun.file(file).bytes()
        var res = await fetch(`https://upload.zhi.shiliew.com/?ChatUUID=${ChatUUID}&Kind=file&Token=${this.token}`, {
            method: "PUT",
            body: await zhi.encrypt_file(this.chats[ChatUUID].Key, ChatUUID, this.chats[ChatUUID].UserUUID, b),
        })
        if (res.status != 200) {
            throw await res.text()
        }
        var FileUUID = await res.text()
        this.ws.send(JSON.stringify({
            MessageUUID: v7(),
            ChatUUID: ChatUUID,
            UserUUID: this.chats[ChatUUID].UserUUID,
            Payload: await zhi.encrypt_payload(this.chats[ChatUUID].Key, ChatUUID, this.chats[ChatUUID].UserUUID, JSON.stringify({
                Kind: "file",
                Size: b.length,
                FileName: FileName,
                FileUUID: FileUUID,
                CreatedAt: lib.now(),
                Name: this.chats[ChatUUID].Name,
                AvatarUUID: this.chats[ChatUUID].AvatarUUID,
            })),
        }))
    }
    // delete message from server db, and send a action to users to let them delete this message from their local db
    async action_delete_message(ChatUUID, MessageUUID) {
        var action = JSON.stringify({
            Action: "DELETE",
            MessageUUID: MessageUUID,
            AvatarUUID: this.chats[ChatUUID].AvatarUUID,
        })
        this.ws.send(JSON.stringify({
            MessageUUID: v7(),
            ChatUUID: ChatUUID,
            UserUUID: this.chats[ChatUUID].UserUUID,
            Payload: `ACTION:${action}`,
        }))
    }
    // kind is avatar/image/video/file, UUID is avatar UUID or file UUID
    // return encrypted Uint8Array
    async fetch_file(ChatUUID, kind, UUID) {
        var res = await fetch(`https://zhi.shiliew.com/${ChatUUID}/${kind}/${UUID}?Token=${this.token}`)
        if (res.status != 200) {
            throw await res.text()
        }
        return new Uint8Array(await res.arrayBuffer())
    }
    // delete messages from server db, if specify MessageUUID then clear messages before/and MessageUUID, otherwise clear all
    async clear_messages(ChatUUID, MessageUUID) {
        var res = await fetch(`https://api.txthinking.com/im/http/BotClearMessages?ChatUUID=${ChatUUID}&MessageUUID=${MessageUUID ? MessageUUID : ''}&Token=${this.token}`)
        if (res.status != 200) {
            throw await res.text()
        }
    }
    // remove a user
    async remove_user(ChatUUID, UserUUID) {
        var res = await fetch(`https://api.txthinking.com/im/http/BotRemoveUser?ChatUUID=${ChatUUID}&UserUUID=${UserUUID}&Token=${this.token}`)
        if (res.status != 200) {
            throw await res.text()
        }
    }
}

export default Bot
