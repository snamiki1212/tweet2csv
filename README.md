# TwitterBackup to csv

## Prerequirements

save twitter backup data, to read this 👉 https://help.twitter.com/en/managing-your-account/how-to-download-your-twitter-archive

## Installation:

```zsh
yarn
# or
npm i

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

## Usage:

```zsh
yarn convert
# >> output.csv

yarn convert:json
# >> output.json
```