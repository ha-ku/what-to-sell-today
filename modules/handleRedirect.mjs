import https from 'https';

function handleRedirect(res, callback) {
	if(Math.floor(res.statusCode / 100) === 3 && res.headers.location) {
		https.request(res.headers.location, res => handleRedirect(res, callback)).end();
	}
	else {
		callback(res);
	}
}

export default handleRedirect;
