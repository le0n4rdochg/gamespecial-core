const express = require('express')
const bodyParser = require("body-parser");
const app = express()
const port = 3002
const mongoose = require("mongoose");
const cors = require("cors")
const http = require('http').Server(app);
const io = require('socket.io')(http, {
  cors: {
    origin: "*"
  }
});

/* Connect to database */
mongoose.connect('mongodb://leonardo:Krislainyamor1447@200.98.203.39/admin', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true,
});

io.on('connection', function(socket) {
  socket.join(socket.handshake.address);

  socket.on('disconnect', function () {
    console.log('A user disconnected');
  });
});

const game_schema = require("./../schemas/game.schema");

app.use(bodyParser.json());
app.use(cors());

app.post('/search', async function (req, res) {
  const { q } = req.body;

  const Results = await game_schema.find({ title: new RegExp("\\b" + q + ".*", "gi") }, { _id: 0, title: 1, id: 1, released: 1, image: 1, url: 1 }).sort("-views")
  let status = Results.length > 0;

  res.json({ status, Results })
})

app.post("/hardware-identification", async (req, res) => {
  const ip = req.headers['cf-connecting-ip'] || req.headers['x-forwaded-for'] || req.connection.remoteAddress;

  io.to(ip).emit("specs", "eae")
})

app.get('/games/:page', async (req, res) => {
  const { page } = req.params;

  const Games = await game_schema.find({}, { image: 1, title: 1, id: 1, released: 1, crawl_info: 1, url: 1, _id: 0 }, {
    skip: (page * 15),
    limit: 15,
    sort: {
      views: -1,
      "_id": -1
    }

  })

  const status = (Games.length > 0)

  return res.json({ status, Games })
})

app.get('/post/:id/:artigo', async (req, res) => {
  const { id, artigo } = req.params;

  const Data = await game_schema.findOne({ id });
  const status = (Data)

  if (status) await game_schema.findOneAndUpdate({ id }, { $inc: { views: 1 } }) /* Increment views */


  res.json({ status, Data })
})

http.listen(port, '127.0.0.1')