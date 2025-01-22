# Bot of Zhi

https://www.txthinking.com/zhi.html

## Usage

```
import Bot from 'https://raw.githubusercontent.com/TxThinkingInc/zhi.js/refs/heads/master/bot.js'

var bot = await Bot.init("Bot Token", [ // get from https://www.txthinking.com/zhi.html
    // One Bot Token can be used in multiple Chats
    {
        ChatUUID: "", // get from https://www.txthinking.com/zhi.html
        Key: "", // your Chat Key
        UserUUID: "", // get from https://www.txthinking.com/zhi.html
        Name: "Bot", // bot name
        Avatar: "/root/robot.png", // bot avatar, file path
    },
])
await bot.connect()
bot.on_message(function(m) { // must call this method, ACK will be responded inside.
    console.log(m)
})
await bot.send_text("The ChatUUID", "Hello")
bot.close()
```

## Install bun via [nami](https://github.com/txthinking/nami) and Run

```
nami install bun bun.plus
bun --preload ~/.nami/bin/_bun_import_url.js your.js
```
