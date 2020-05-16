import { Parser } from "json2csv";
import { writeFile } from "fs";
import { config } from "./config";

const tweets = require("./backup/data/tweet");

const outputPath = "./output.csv";
const excludingIDs = config.excludingIDs;
const squash = (list: any[]) => list.map((obj) => obj.tweet);
const addCustomFields = (list: any[]) =>
  list.map((it: any) => {
    const hasAtMark = it.full_text.includes("@");
    const hasHTTP = it.full_text.includes("http");
    const isMoreThan139 = Array.from(it.full_text).length >= 139;
    const isExcludedID = excludingIDs.includes(Number(it.id));
    const created_at_unixtime = new Date(it.created_at).getTime() / 1000; // REF: https://stackoverflow.com/questions/11893083/convert-normal-date-to-unix-timestamp
    const SHOULD_VIEW =
      !hasAtMark && !hasHTTP && isMoreThan139 && !isExcludedID;
    return Object.assign(it, {
      created_at_unixtime,
      hasAtMark,
      hasHTTP,
      isMoreThan139,
      isExcludedID,
      SHOULD_VIEW,
    });
  });

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
  // custom fields
  "created_at_unixtime",
  "isMoreThan139",
  "hasAtMark",
  "hasHTTP",
  "isExcludedID",
];
const options = { fields };

const main = (tweets: any[]) => {
  try {
    // 事前にデータ整形
    const squashed = squash(tweets);
    const data = addCustomFields(squashed);

    // csv化
    const parser = new Parser(options);
    const csv = parser.parse(data);

    // 書き込み
    writeFile(outputPath, csv, (err: any) => {
      if (err) throw err;
    });
  } catch (e) {
    console.error(e);
  }
};

/******************
 * Main
 ******************/
tweets ? main(tweets) : console.log("cannot find tweets data");
