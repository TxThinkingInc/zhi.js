# Bot of Zhi

https://www.txthinking.com/zhi.html

## Usage

```
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
