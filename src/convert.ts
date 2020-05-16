import { Parser } from "json2csv";
import { writeFile } from "fs";
import { config } from "../config";

const outputFile = "./output";
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

const getFields = (obj: any) => Object.keys(obj);
const jsonrize = (list: any[]) => list.reduce((prev, curr) => ({...prev, [curr.id]: curr}), {})

export const main = (operate: "csv" | "json", tweets: any[]) => {
  try {
    // shape before CSVrize
    const squashed = squash(tweets);
    const data = addCustomFields(squashed);

    // build csv from json
    let buildObject;
    if (operate === "csv") {
      const fields = getFields(data[0]);
      const parser = new Parser({ fields });
      buildObject = parser.parse(data);
    } else if (operate === "json") {
      const json = jsonrize(data)
      buildObject = JSON.stringify(json);
    } else {
      throw new Error("invalid operate param.");
    }

    // write
    writeFile(`${outputFile}.${operate}`, buildObject, (err: any) => {
      if (err) throw err;
    });
  } catch (e) {
    console.error(e);
  }
};
