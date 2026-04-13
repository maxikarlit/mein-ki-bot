const http = require("http");
http.createServer((req, res) => {
    res.write("Bot läuft!");
    res.end();
}).listen(process.env.PORT || 3000);

const { Bot } = require("grammy");
const Groq = require("groq-sdk");

// HIER DEINE KEYS GENAU PRÜFEN
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN; // Ganzen Token hier rein!
const GROQ_API_KEY = process.env.GR0Q_API_KEY; // Ganzen Key hier rein!

const bot = new Bot(TELEGRAM_TOKEN);
const groq = new Groq({ apiKey: GROQ_API_KEY });

console.log("Starte Bot...");

bot.on("message:text", async (ctx) => {
    try {
        console.log("Nachricht erhalten: " + ctx.message.text);
        console.log("KI wird angefragt...");
        
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: "Antworte kurz auf Deutsch." },
                { role: "user", content: ctx.message.text }
            ],
           model: "llama-3.3-70b-versatile"
        });

        const antwort = chatCompletion.choices[0].message.content;
        console.log("Antwortet jetzt...");
        await ctx.reply(antwort);
        console.log("Erfolgreich geantwortet!");

    } catch (error) {
        console.error("FEHLER:", error.message);
        await ctx.reply("Fehler: " + error.message);
    }
});

bot.start();
console.log("Bot läuft... Schreib ihm jetzt bei Telegram!");