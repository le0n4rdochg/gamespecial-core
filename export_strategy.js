const request = require("request-promise");
const cheerio = require("cheerio");
const mongoose = require("mongoose");
const signale = require("signale");
const fs = require("fs");
const urlSlug = require("url-slug");
const uniqid = require('uniqid');
const game_schema = require("./schemas/game.schema");

mongoose.connect('mongodb://leonardo:Krislainyamor1447@200.98.203.39/admin', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true
});

const nao_foi = fs.readFileSync("./nao_foi.txt", 'utf-8').split("\n");

let games = [];


const Crawl = async line => {
    try {
        const [game, id] = line.split("|");

        const FindTitle = await game_schema.findOne({ title: new RegExp("\\b" + game + ".*", "gi") });

        if (FindTitle) {
            await game_schema.findOneAndUpdate({ id: FindTitle.id }, { $set: { id } })
        } else {
            const LoadGame = await request({
                url: "https://gamespecial.com/robots/editor.php",
                headers: {
                    cookie: "gadsTest=test; __cfduid=d151bb9da4e664c0d637996a2df6ede971610809471; PHPSESSID=akcqvkeomntps5es6b1brm9jsa; _ga=GA1.2.1144402229.1610814364; __gads=ID=bcf310f20f98883c-22c625339ab800d3:T=1610814364:RT=1610814364:S=ALNI_Mb7JA2-9j9FBLSW8bO_IIUbJx2hTQ; wordpress_test_cookie=WP+Cookie+check; wp-settings-time-10=1610841504; wp-settings-10=editor%3Dtinymce; _gid=GA1.2.1519246242.1611516459; penci_law_footer=2; wordpress_logged_in_16230b37ffc15c0644e03119bdc842a8=leonardo%7C1611842401%7CzZaUedvkpMMkvwy6Sy3Lzln7lN0DTwO0a2gja4jpG1S%7C698035a6bd0c33c194c9605ec4660db99f00f77d6f806200f734180d2693972c; wfwaf-authcookie-6882487f110e4ee01ecb4977a0f796bc=10%7Cadministrator%7C9c8c00fe18bd78f24e6cc9f96caad80c06b8c79e42763e59de3dc8cee7ac94eb"
                },
                qs: {
                    load: id
                }
            })

            const $ = cheerio.load(LoadGame);

            const ImgSrc = $(".card-avatar .img").attr("src");
            if (ImgSrc.length > 1) {
                const id = $("input[name='ID']").val()
                const GameName = $("#name").val();
                const Developer = $("#g_dev").val();
                const so = $("#min_os").val();
                const cpu = $("#min_proc").val();
                const memory = $("#min_ram").val();
                const storage = $("#min_hdd").val();
                const gpu = $("#min_vcard").val();

                const Image = await request({
                    url: ImgSrc,
                    method: 'get',
                    encoding: null
                });

                let imageName = uniqid();
                fs.appendFileSync("./images/" + imageName + ".jpg", Image);

                /* Search Trailer */
                const YoutubeSearch = await request({
                    url: "https://youtube-search-results.p.rapidapi.com/youtube-search/",
                    headers: {
                        'x-rapidapi-key': "c3396cfbdamsh9c121d8b125c966p1008e2jsnb545182f6e05"
                    },
                    json: true,
                    qs: {
                        q: GameName + " game trailer"
                    }
                });

                let trailer;

                for (const Item of YoutubeSearch.items) {
                    if (Item.id) {
                        trailer = Item.id;
                        break;
                    }
                }

                const Schema = {
                    id,
                    title: GameName,
                    image: imageName,
                    url: urlSlug(GameName),
                    developer: Developer,
                    released: "N/A",
                    plataform: "N/A",
                    trailer: trailer,
                    description: null,
                    system: {
                        processor: cpu,
                        graphic_driver: gpu,
                        os: so,
                        ram: memory,
                        storage
                    }
                }

                new game_schema(Schema).save().then(data => {
                    console.log(data)
                })
            }
        }
    } catch (e) {

    }
    Crawl(nao_foi.shift())
}

for (const line of nao_foi.splice(0, 10)) {
    Crawl(line)
}

