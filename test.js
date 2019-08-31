const fs = require("fs");
const { artParser } = require("./index.js");

const artFile = fs.readFileSync("./example.art", { encoding: "UTF-8" });

const parseResponse = artParser.run(artFile);

console.log(JSON.stringify(parseResponse.result, null, 2));
