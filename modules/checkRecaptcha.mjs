import https from "https";
import process from "process";

const SECRET = {
	v2: process.env.WTST_RECAPTCHA_KEY_V2,
	v3: process.env.WTST_RECAPTCHA_KEY_V3
}
const hosts = process.env.WTST_HOSTS.split(' ');

const checkRecaptcha = (version, token, host) => {
	return new Promise((resolve, reject) => {
		let response = '';
		const req = https.request(`https://www.google.com/recaptcha/api/siteverify?secret=${SECRET[version]}&response=${token}`, {
			method: 'POST'
		}, (res) => {
			res.on('data', chunk => response = response + chunk)
			res.on('end', () => {
				const {success, hostname, score, action} = JSON.parse(response);
				if(!hostname || (hostname !== host && hosts.every(host => !hostname.endsWith(host))) || (version === 'v3' && action !== 'marketReport')) {
					//onsole.log('invalid recaptcha result for', hostname, ':', action);
					console.log('invalid recaptcha result', response);
					reject({code: 400, content: 'invalid recaptcha result'});
					return;
				}
				if(!success || (version === 'v3' && score < 0.5)){
					console.log('recaptcha failed.' + version === 'v3' ? `, score ${score}` : '');
					reject({code: 403, content: 'recaptcha failed'});
					return;
				}
				console.log('recaptcha pass.' + version === 'v3' ? `, score ${score}` : '');
				resolve();
			})
		});
		req.end();
	})
}


export default checkRecaptcha;