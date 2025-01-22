# Bot of Zhi

https://www.txthinking.com/zhi.html

## Usage

```
import Bot from 'https://raw.githubusercontent.com/TxThinkingInc/zhi.js/refs/heads/master/bot.js'

var bot = await Bot.init("Bot Token", [
    {
        ChatUUID: "", // get from https://www.txthinking.com/zhi.html
        Key: "", // your Chat Key
        UserUUID: "", // get from https://www.txthinking.com/zhi.html
        Name: "Bot",
        Avatar: "/root/robot.png",
    },
])
await bot.connect()
await bot.send_text("The ChatUUID", "Hello")
bot.close()
```

## Install bun via [nami](https://github.com/txthinking/nami) and Run

```
nami install bun bunu
bun --preload ~/.nami/bin/_bun_import_url.js your.js
```
