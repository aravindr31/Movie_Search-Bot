require("dotenv").config();
const axios = require("axios");
const TelegramBot = require("node-telegram-bot-api");

const token = process.env.Token;

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, { polling: true });

bot.on("message", (msg, match) => {
  const chatId = msg.chat.id;
  const resp = match[1];
  let Movie_Name = msg.text;
  if (!msg.entities && Movie_Name != "") {
    spiltName = Movie_Name.split(" ");
    let url = "";
    if (spiltName.length != 1) {
      for (let i = 0; i < spiltName.length; i++) {
        if (i != 0) url = url + "+" + spiltName[i];
        else url = spiltName[0];
      }
    } else {
      url = spiltName[0];
    }
    axios
      .get(
        "https://yts.proxyninja.org/api/v2/list_movies.json?&query_term=" +
          url +
          "&sort_by=title&quality=720p&limit=10"
      )
      .then(async (res) => {
        // let response = bodyParser.JSON(res);
        if (res.data.data.movie_count != 0) {
          await bot.sendMessage(chatId, "Found these movies... :)");
          await res.data.data.movies.map(async (movie) => {
            let hash = "";
            await movie.torrents.map((torrent) => {
              hash = torrent.hash;
              quality = torrent.quality;
              seeds = torrent.seeds;
              size = torrent.size;
              directUrl = torrent.url;
            });
            let magneticURL =
              "magnet:?xt=urn:btih:" +
              hash +
              "&dn=" +
              url +
              "+%28" +
              movie.year +
              "%29+%5B" +
              quality +
              "%5BYTS.MX%5D&tr=udp%3A%2F%2Fglotorrents.pw%3A6969%2Fannounce&tr=udp%3A%2F%2Ftracker.openbittorrent.com%3A80&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Fp4p.arenabg.ch%3A1337&tr=udp%3A%2F%2Ftracker.internetwarriors.net%3A1337";
            await bot.sendPhoto(chatId, movie.medium_cover_image, {
              caption:
                "Name: " +
                movie.title_long +
                "\nQuality: " +
                quality +
                "\nSeeds: " +
                seeds +
                "\nSize: " +
                size +
                "\n\nURL:" +
                directUrl +
                "\n\nMagnetic Link: \n" +
                magneticURL,
            });
          });
        } else bot.sendMessage(chatId, "No Movies Found... :(");
      });
  } else if (msg.entities) {
    bot.sendMessage(
      chatId,
      "Lets start... :) \nSearch for any movie from YTS...."
    );
  } else bot.sendMessage(chatId, "Nothing to search... :{)");
});
