const express = require('express')
const app = express()
const port = 3001

app.use(express.static(__dirname + "/./../images"));

app.all("*", (req, res) => {
    res.send("not found")
})
app.listen(port)