const tweets = require("./backup/data/tweet");
const { Parser } = require("json2csv");
import { writeFile } from "fs";

const outputPath = "./output.csv";
const squash = (list: any[]) => list.map((obj) => obj.tweet);

// TODO: 動的に取りたい
const fields = [
  "retweeted",
  "source",
  "entities",
  "display_text_range",
  "favorite_count",
  "id_str",
  "truncated",
  "retweet_count",
  "id",
  "created_at",
  "favorited",
  "full_text",
  "lang",
];
const options = { fields };

const main = (tweets: any[]) => {
  try {
    // 事前にデータ整形
    const squashed = squash(tweets);

    // csv化
    const parser = new Parser(options);
    const csv = parser.parse(squashed);

    // 書き込み
    writeFile(outputPath, csv, (err:any) => {
      if(err) throw err;
    });
  } catch (e) {
    console.error(e);
  }
};

tweets ? main(tweets) : console.log("cannot find tweets data");
