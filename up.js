const mongoose = require("mongoose");
const request = require("request-promise");
const urlSlug = require("url-slug");

const game_schema = require("./schemas/game.schema");
const Game_schema = require("./schemas/game_.schema");

let gameList = [];

mongoose.connect('mongodb://leonardo:Krislainyamor1447@200.98.203.39/admin', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true
});

const Init = async (game) => {
    try {
        const Game = {
            id: game.id,
            title: game.title,
            image: game.image,
            developer: game.developer,
            plataform: "steam",
            released: game.released,
            url: null,
            trailer: null,
            system: {
                os: game.requirements.so,
                processor: game.requirements.processor,
                ram: game.requirements.memory,
                storage: game.requirements.storage,
                graphic_driver: game.requirements.graphic_driver
            },
            crawl_info: {
                app_id: game.id
            }
        };


        /* Url Slug Proccess */
        const url = urlSlug(Game.title);
        Game.url = url;

        /* Search Trailer */
        const YoutubeSearch = await request({
            url: "https://youtube-search-results.p.rapidapi.com/youtube-search/",
            json: true,
            headers: {
                'x-rapidapi-key': "c3396cfbdamsh9c121d8b125c966p1008e2jsnb545182f6e05",
                'x-rapidapi-host': "youtube-search-results.p.rapidapi.com",
                useQueryString: "true"
            },
            qs: {
                q: game.title + " game trailer",
            }
        })

        const items = YoutubeSearch.items;
        items.splice(0, 1);

        if (items.length > 0) {
            for (const item of items) {
                if (item.title.toLowerCase().includes("trailer") && !item.title.toLowerCase().includes("mobile")) {
                    Game.trailer = item.id;
                    break;
                }
            }
        }

        console.log(Game.trailer);


        await Game_schema.findOneAndDelete({ id: game.id });

        await game_schema(Game).save()

        console.log(Game)

        Init(gameList.shift())
    } catch (e) {
        Init(gameList.shift())
    }
}

const Launch = async () => {
    const Games = await Game_schema.find({}).limit(2000);

    if (Games.length > 0) {
        gameList = Games;
        Init(gameList.shift())
    } else {
        console.log("no game for crawl");
        process.exit(-1);
    }
}

Launch()