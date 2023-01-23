import RateLimiter from './RateLimiter.mjs';
import handleRedirect from './handleRedirect.mjs';
import { client, STATUS } from './redisWrapper.mjs';

const options = {
	method: 'GET',
	headers: {
		"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.102 Safari/537.36"
	}
};
//let IDcollection = {};
//const ID_EXPIRE_TIME = 86400000;
const rateLimiter = new RateLimiter(20);
const b64ncd = string => Buffer.from(string).toString('base64');
const KEY = "UniID";

function getUniID({ name, ID }) {
	if(ID !== undefined) {
		//console.log('ID already provided');
		return [ID, {}];
	}
	return (client.status === STATUS.CONN ? client.hGet(KEY, b64ncd(name)) : Promise.resolve(null))
	.then((cacheID) => {
		cacheID = Number(cacheID);
		if(cacheID) {
			//console.log(`redis cache hit: ${name} => ${cacheID}`);
			return [cacheID, {}];
		}
		else {
			const regex = new RegExp("[\u4E00-\u9FA5]+");
			let api = regex.test(name) ?
				`https://cafemaker.wakingsands.com/search?indexes=item&filters=ItemSearchCategory.ID>=1&columns=ID,Name&string=${name}&sort_field=LevelItem&sort_order=desc&private_key=4e8274c209374fb2a4011304ecc4ac73f741216f087b4714aa1bee933b7589e5`
				: `https://xivapi.com/search?indexes=item&filters=ItemSearchCategory.ID>=1&columns=ID,Name&string=${name}&limit=5&sort_field=LevelItem&sort_order=desc&private_key=2e4939e3335c417386df0b5174752fbd0236e9e86bc1467ab897f817f3cda1bb`;
			return new Promise((resolve, reject) =>
				rateLimiter.httpsRequest(api, options, res => handleRedirect(res, async (res) => {
					let body = '';
					res.on('data', chunk => {body += chunk;})
					res.on('end', async () => {
						if(res.statusCode !== 200) {
							if(res.statusCode === 500) {
								console.log(`retry ${name}`)
								resolve(await getUniID({name}));
							}
							else {
								console.log(`get ${name} uid return ${res.statusCode}`)
								reject(res.statusCode);
							}
						}
						else{
							let results = JSON.parse(body).Results;
							if(results.length >= 1) {
								//console.log(results.map(res => res.Name), name);
								let same = results.filter(res => res.Name === name);
								if(same.length >= 1 && client.status === STATUS.CONN) {
									client.hSet(KEY, b64ncd(name), same[0].ID.toString()).catch(console.log);
									console.log('save ID', name, same[0].ID);
								}
								resolve([same.length >= 1 ? same[0].ID : results[0].ID, res.headers]);
							} else {
								console.log(`query ${name} did not get id.`, results);
								reject(404);
							}
						}
					})
				}))
			);
		}
	});
}

export default getUniID;
