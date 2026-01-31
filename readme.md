# Bot of Zhi

https://www.txthinking.com/zhi.html

## Install bun via [nami](https://github.com/txthinking/nami)

```
nami install bun bun.plus
```

## Make AvatarUUID

> You only need to make AvatarUUID once for each Chat

```
import zhi from 'https://raw.githubusercontent.com/TxThinkingInc/zhi.js/refs/heads/master/lib.js';

var BotToken = ""   // get from https://www.txthinking.com/zhi.html
var ChatUUID = ""   // get from https://www.txthinking.com/zhi.html
var Key = ""        // your Chat Key
var UserUUID = ""   // get from https://www.txthinking.com/zhi.html
var avatar = ""     // local avatar image path

var b = await Bun.file(avatar).bytes()
var res = await fetch(`https://upload.zhi.shiliew.com/?ChatUUID=${ChatUUID}&Kind=avatar&Token=${BotToken}`, {
    method: "PUT",
    body: await zhi.encrypt_file(Key, ChatUUID, UserUUID, b),
})
if (res.status != 200) {
    throw await res.text()
}
var AvatarUUID = await res.text()

console.log(AvatarUUID)
```

```
bun --preload ~/.nami/bin/_bun_import_url.js your.js
```

## Run Bot

```
import Bot from 'https://raw.githubusercontent.com/TxThinkingInc/zhi.js/refs/heads/master/bot.js'

// This will create a Client with a random Device UUID string, read bot.js for more.
var bot = await Bot.init("Bot Token", [ // get from https://www.txthinking.com/zhi.html, one Bot Token can be used in multiple Chats
    {
        ChatUUID: "",   // get from https://www.txthinking.com/zhi.html
        Key: "",        // your Chat Key
        UserUUID: "",   // get from https://www.txthinking.com/zhi.html
        Name: "",       // bot name
        AvatarUUID:"",  // AvatarUUID you maked
    },
])

// You should call connect only once, then use the Client like 'daemon'.
//
// The Client(based on Device UUID string) should only has one connection.
// If the server finds that a Client(based on Device UUID string) already has a connection, the server will reject the incoming connection.
//
// If you implement your own reconnection mechanism, you should ensure that call connect waiting the previous connection to be released.
// A reconnection interval of waiting 60 seconds or less is recommended.
await bot.connect()

// You must call on_message for listening new messages, ACK will be responded inside.
bot.on_message(function(m) {
    console.log(m)
})

// When you want to send message, such as text, call send_text at where you want.
await bot.send_text("The ChatUUID", "Hello")

// You should only call close when you don't need the Client at all. Or want to reconnect: close, wait a moment, connect.
bot.close()
```

```
bun --preload ~/.nami/bin/_bun_import_url.js your.js
```
