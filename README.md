# TwitterBackup to csv

## Prerequirements

Save Twitter backup from here:👉 https://help.twitter.com/en/managing-your-account/how-to-download-your-twitter-archive

## Installation:

```zsh
pnpm i

# link
ln -s <twitter-backup-dir> backup
# e.g) ❯ ln -s "/Users/me/Downloads/twitter-2020-04-22-fdskriudfgjkfdnmvcxjhdfsiu" backup

# check to exist file
ls backup/data/tweet.js

# fix line:1 above
vim backup/data/tweet.js

### before: window.YTD.tweet.part0 = [ {
### after: module.exports = [{

# create config
cp config.ts.example config.ts
```

To convert a reviewed TweetClaw JSON export instead of a Twitter archive file,
set the config like this:

```ts
export const config = {
  outputPath: "dist/",
  inputPath: "examples/tweetclaw-export.json",
  inputSource: "tweetClaw",
  excludingIDs: [],
};
```

## Usage:

```zsh
pnpm convert
open dist
```
