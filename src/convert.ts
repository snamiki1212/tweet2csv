import { Parser } from "json2csv";
import { writeFile, mkdirSync } from "fs";
import { config } from "../config";

// Const
const outputPath = config.outputPath;
const outputFolder = (new Date()).toISOString().replace(/:/g, "").substring(0, 17);
const outputDir = `${outputPath}/${outputFolder}`;
const outputFullPath = (file: string) => { return `${outputDir}/${file}` }
const excludingIDs = config.excludingIDs;
const inputPath = config.inputPath

// Input Data
const tweets = require(`../${inputPath}`);

// Helpers
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
const jsonrize = (list: any[]) => list.reduce((prev, curr) => ({ ...prev, [curr.id]: curr }), {})

// Main
export const convert = () => {
  try {

    // shape before CSVrize
    const squashed = squash(tweets);
    const data = addCustomFields(squashed);

    // pre
    mkdirSync(outputDir, { recursive: true });


    // build csv
    (() => {
      const fields = getFields(data[0]);
      const parser = new Parser({ fields });
      const buildObject = parser.parse(data);

      // write
      const path = outputFullPath("output.csv")
      writeFile(path, buildObject, (err: any) => {
        if (err) throw err;
      });
    })();

    // build json
    (() => {
      const json = jsonrize(data)
      const buildObject = JSON.stringify(json);

      // write
      const path = outputFullPath("output.json")
      writeFile(path, buildObject, (err: any) => {
        if (err) throw err;
      });
    })();

  } catch (e) {
    console.error(e);
  }
};
