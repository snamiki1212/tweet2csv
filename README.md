README

## Usage:

```zsh
yarn

ln -s <twitter-backup-dir> backup
# e.g) ❯ ln -s "/Users/me/Downloads/twitter-2020-04-22-46dd618469d707bebf53bcb34e33dc54fb08725379ad34506affa7e769b8497b (1)" backup

# ファイルがあるか確認
ls backup/data/tweet.js

# jsを変更
vim backup/data/tweet.js

# 1行目を下記のように変更
# 前: window.YTD.tweet.part0 = [ {
# 後: module.exports = [{



```

```

