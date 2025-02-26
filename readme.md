# Bot of Zhi

https://www.txthinking.com/zhi.html

## Install bun via [nami](https://github.com/txthinking/nami) and Run

```
nami install bun bun.plus
```

### Make AvatarUUID

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

### Run Bot

```
import Bot from 'https://raw.githubusercontent.com/TxThinkingInc/zhi.js/refs/heads/master/bot.js'

var bot = await Bot.init("Bot Token", [ // get from https://www.txthinking.com/zhi.html, one Bot Token can be used in multiple Chats
    {
        ChatUUID: "",   // get from https://www.txthinking.com/zhi.html
        Key: "",        // your Chat Key
        UserUUID: "",   // get from https://www.txthinking.com/zhi.html
        Name: "",       // bot name
        AvatarUUID:"",  // AvatarUUID you maked
    },
])
await bot.connect()
bot.on_message(function(m) { // must call this method, ACK will be responded inside.
    console.log(m)
})
await bot.send_text("The ChatUUID", "Hello")
bot.close()
```

```
bun --preload ~/.nami/bin/_bun_import_url.js your.js
```
