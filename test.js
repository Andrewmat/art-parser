const fs = require("fs");
const { artParser } = require("./index.js");

const artFile = fs.readFileSync("./example0.art", { encoding: "UTF-8" });

const parseResponse = artParser.run(artFile);

if (parseResponse.isError) {
  console.error(parseResponse.error);
} else {
  // console.log(JSON.stringify(parseResponse.result, null, 2));
}
