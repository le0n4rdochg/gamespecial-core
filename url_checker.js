const request = require("request-promise");
const fs = require("fs");
const cheerio = require("cheerio");
const urls = fs.readFileSync("urls.txt", 'utf-8').split('\n');
const signale = require("signale");
urls.splice(0, 1); // discard first

const CheckHttp = async line => {
    const [
        url
    ] = line.split(",");

    let path = url.split("com/").splice(-1).join(" ");

    const urlTemplate = 'http://localhost:3000/' + path;

    const Page = await request({
        url: urlTemplate,
        method: "get"
    })

    const $ = cheerio.load(Page);

    const Title = $(".page h1").text();

    if (Title.length > 0) {
        signale.success(`${Title} -> ${urlTemplate}`)
    } else {
        signale.error(`${Title} -> ${urlTemplate}`)
    }

    if(urls.length > 0) CheckHttp(urls.shift())
}

for (const url of urls.splice(0, 50)) {
    CheckHttp(url)
}