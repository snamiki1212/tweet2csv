import { Parser } from "json2csv";
import { writeFile } from "fs";
import { config } from "../config";

const tweets = require("../backup/data/tweet");

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

const getFields = (obj: any) => Object.keys(obj)

const main = (tweets: any[]) => {
  try {
    // shape before CSVrize
    const squashed = squash(tweets);
    const data = addCustomFields(squashed);

    // build csv from json
    const fields = getFields(data[0])
    const parser = new Parser({ fields });
    const csv = parser.parse(data);

    // write
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
