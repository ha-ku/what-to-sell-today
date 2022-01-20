import https from 'https';
import { setMaxListeners } from 'events';


class Context {
	constructor() {
		this.ac = new AbortController();
		setMaxListeners(20, this.ac.signal);
		this.agent = new https.Agent({
			keepAlive: true,
			//maxSockets: 64,
			timeout: 3000
		});
	}
}

export default Context;
