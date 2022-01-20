export default function parseQuery(req) {
	console.log(req.url, new URL(req.url, "https://" + req.headers.host).searchParams);
	return Object.fromEntries(new URL(req.url, "https://" + req.headers.host).searchParams);
}
