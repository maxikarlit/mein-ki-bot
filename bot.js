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
           model: "llama-3.2-11b-vision-preview"
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
// Dieser Teil reagiert, wenn du ein Foto schickst
bot.on("message:photo", async (ctx) => {
  try {
    // 1. Die ID des größten Fotos holen (Telegram schickt immer mehrere Größen)
    const photo = ctx.message.photo[ctx.message.photo.length - 1];
    const file = await ctx.getFile();
    
    // 2. Den Link zum Bild erstellen
    const imageUrl = `https://api.telegram.org/file/bot${process.env.TELEGRAM_TOKEN}/${file.file_path}`;

    await ctx.reply("Ich schaue mir das Bild an...");

    // 3. Die Anfrage an Groq senden
    const response = await groq.chat.completions.create({
      model: "llama-3.2-11b-vision-preview",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: "Was siehst du auf diesem Bild? Beantworte auch eventuelle Fragen dazu." },
            { type: "image_url", image_url: { url: imageUrl } }
          ],
        },
      ],
    });

    await ctx.reply(response.choices[0].message.content);
  } catch (error) {
    console.error("Fehler beim Bild:", error);
    await ctx.reply("Sorry, ich konnte das Bild nicht auswerten.");
  }
});
bot.start();
console.log("Bot läuft... Schreib ihm jetzt bei Telegram!");