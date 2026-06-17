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
const inputSource = (config as any).inputSource || "twitterArchive";

// Input Data
const inputData = require(`../${inputPath}`);

// Helpers
const squash = (list: any[]) => list.map((obj) => obj.tweet);
const asObject = (value: any) =>
  value && typeof value === "object" && !Array.isArray(value) ? value : {};
const firstString = (...values: any[]) => {
  for (const value of values) {
    if (value !== undefined && value !== null && String(value).length > 0) {
      return String(value);
    }
  }
  return "";
};
const firstNumber = (...values: any[]) => {
  for (const value of values) {
    const number = Number(value);
    if (isFinite(number)) return number;
  }
  return 0;
};
const unwrapTweetClawExport = (input: any) => {
  if (Array.isArray(input)) return input;
  const wrapped = asObject(input);
  for (const key of ["data", "tweets", "items", "results", "records"]) {
    if (Array.isArray(wrapped[key])) return wrapped[key];
  }
  return [];
};
const normalizeTweetClawRecord = (record: any) => {
  const item = asObject(record);
  const author = asObject(item.author || item.user);
  const metrics = asObject(item.metrics || item.public_metrics);
  const id = firstString(item.id, item.tweetId, item.tweet_id, item.rest_id);
  const authorUsername = firstString(
    item.authorUsername,
    item.author_username,
    item.username,
    item.handle,
    author.username,
    author.screen_name,
    author.handle
  ).replace(/^@/, "");
  return {
    id,
    created_at: firstString(item.created_at, item.createdAt, item.timestamp, item.date),
    full_text: firstString(item.full_text, item.fullText, item.text, item.tweetText, item.content),
    source: "tweetclaw",
    tweet_url: firstString(
      item.url,
      item.tweetUrl,
      item.tweet_url,
      item.permalink,
      id && authorUsername ? `https://x.com/${authorUsername}/status/${id}` : ""
    ),
    author_username: authorUsername,
    author_name: firstString(item.authorName, item.author_name, item.name, author.name),
    like_count: firstNumber(item.likeCount, item.like_count, item.likes, metrics.like_count, metrics.likes),
    retweet_count: firstNumber(
      item.retweetCount,
      item.retweet_count,
      item.retweets,
      metrics.retweet_count,
      metrics.retweets
    ),
    reply_count: firstNumber(item.replyCount, item.reply_count, item.replies, metrics.reply_count, metrics.replies),
    quote_count: firstNumber(item.quoteCount, item.quote_count, item.quotes, metrics.quote_count, metrics.quotes),
  };
};
const normalizeInput = (input: any) => {
  if (inputSource === "tweetClaw") {
    return unwrapTweetClawExport(input)
      .map(normalizeTweetClawRecord)
      .filter((tweet: any) => tweet.id && tweet.full_text);
  }
  return squash(input);
};
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
    const squashed = normalizeInput(inputData);
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
