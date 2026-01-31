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
bot.on_message(async function(m) {
    console.log(m)
    // reply a message
    await bot.send_text(m.ChatUUID, "Yes!")
})
```

```
bun --preload ~/.nami/bin/_bun_import_url.js your.js
```

## Example: One-shot

A common scenario is sending infrequent but important notifications.

```
import Bot from 'https://raw.githubusercontent.com/TxThinkingInc/zhi.js/refs/heads/master/bot.js'

async function notify(str){
    var bot = await Bot.init("Bot Token", [
        {
            ChatUUID: "",   
            Key: "",        
            UserUUID: "",   
            Name: "",       
            AvatarUUID:"",  
        },
    ])
    await bot.connect()
    await bot.send_text("The ChatUUID", str)
    bot.close()
}

await notify("something went wrong")
```

## Example: Long-running

```
import Bot from 'https://raw.githubusercontent.com/TxThinkingInc/zhi.js/refs/heads/master/bot.js'

var bot = await Bot.init("Bot Token", [
    {
        ChatUUID: "",   
        Key: "",        
        UserUUID: "",   
        Name: "",       
        AvatarUUID:"",  
    },
])

await bot.connect()

// Reconnect
bot.on_close(async function(e) {
    console.log("close", e)
    bot.close()
    await Bun.sleep(60*1000); // 60s or less
    await bot.connect()
})

bot.on_message(async function(m) {
    console.log(m)
    // reply a message
    await bot.send_text(m.ChatUUID, "Yes!")
})

// or send a message at where you want
await bot.send_text("The ChatUUID", "Yes!")
```
