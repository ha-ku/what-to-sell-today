![icon](https://aws-cf.ha-ku.cyou/favicon.ico "icon")
# what-to-sell-today
![Vercel](https://vercelbadge.vercel.app/api/ha-ku/what-to-sell-today)
<br>
Frontend and backend to compare FFXIV item price in various list.<br>
<br>

### What's this?
What-to-sell-today (hereinafter called WTST) offers a frontend and a backend to fetch and calculate basic price and sales information of several specified FFXIV item lists.

### Where does the market data come from?
Data is fetched from [universalis.app](https://universalis.app) API. To help get accurate market data, please visit [universalis repo](https://github.com/Universalis-FFXIV/Universalis) for more infomation.<br>
Users from Chinese servers could refer to [ACT plugins](https://bbs.nga.cn/read.php?tid=22462774) or [Dalamud framework](https://bbs.tggfl.com/topic/32/dalamud-%E5%8D%AB%E6%9C%88%E6%A1%86%E6%9E%B6) instead.

### Frontend deployment
```
git clone https://github.com/ha-ku/what-to-sell-today.git && cd what-to-sell-today
// replace google recaptcha v2 and v3 public key (in module/recaptchaPublicKey.js) with your own.
yarn install && yarn run build
yarn run start
```
The frontend now listen on port 3000.<br>
Things like caddy or nginx could be used to perform port forwarding.

### Backend deployment
```
git clone https://github.com/ha-ku/what-to-sell-today.git && cd what-to-sell-today
WTST_RECAPTCHA_KEY_V2={your own google recaptcha v2 secret key}
WTST_RECAPTCHA_KEY_V3={your own google recaptcha v3 secret key}
WTST_HOSTS={your site hosts with whitespace between}
node --experimental-json-modules ./avro/marketReportServer.mjs
```
The backend now listen on port 9092. You may modify `marketReportServer.mjs` to change the port.<br>
Things like caddy or nginx could be used to perform port forwarding.