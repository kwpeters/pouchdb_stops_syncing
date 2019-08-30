const path = require("path");
const express = require("express");

const port = 8000;

const app = express();
const clientPath = path.resolve(__dirname, "..", "client");
app.use(express.static(clientPath));
const libPath = path.resolve(__dirname, "..", "node_modules");
app.use(express.static(libPath));


app.listen(port, () => {
    console.log(`Listening on port ${port}...`);
});
