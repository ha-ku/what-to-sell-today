import https from 'https';

export default class RateLimiter {
	constructor(rate = 20) {
		this.RATE_LIMIT_SEC = rate;
		this.RETRY = 2;
		this.POOL = [
			{
				prefix: '',
				queue: [],
				history: new Map(),
				processing: null
			}
		];
	}

	balance() {
		return this.POOL.reduce((acc, current) => acc.queue.length > current.queue.length ? current : acc);
	}
	queue({args, retry, resolve, reject, urgent}) {
		let upstream = this.balance();

		if(urgent)
			upstream.queue.unshift({args: args, retry, resolve, reject});
		else
			upstream.queue.push({args: args, retry, resolve, reject});

		if(upstream.processing === null) {
			upstream.processing = setInterval(() => this.handleWaiting(upstream), 1000 / this.RATE_LIMIT_SEC);
		}
	}

	handleWaiting(upstream) {
		if(upstream.queue.length === 0) {
			clearInterval(upstream.processing);
			upstream.processing = null;
			return ;
		}
		const startT = new Date().getTime();
		upstream.history.forEach((value, key) => {
			if(value < startT ||  key < startT - 30000){
				upstream.history.delete(key);
			}
		})
		if(upstream.history.size <= this.RATE_LIMIT_SEC) {
			upstream.history.set(startT, Number.MAX_SAFE_INTEGER);
			let {args, retry, resolve, reject} = upstream.queue.shift();
			let savedArgs = [...args];
			if(args[0].startsWith('http')) {
				args[0] = upstream.prefix + args[0];
			}
			//console.log(args[0], 'send');
			const option = args.find(arg => arg.signal);
			const checkAbort = (signal) => {
				if(signal && signal.aborted) {
					reject(new Error('abort'));
					return true;
				}
			}
			if(checkAbort(option?.signal)) {
				upstream.queue = upstream.queue.filter(req => !req.args.find(arg => arg.signal).signal.aborted)
				return;
			}
			console.log('send', args[0]);
			const req = https.get(...args);
			const doRetry = (code) => {
				upstream.history.set(startT, new Date().getTime())
				console.log(args[0], ' returns ', code, `retry = ${retry}`);
				if(retry >= this.RETRY)
					reject({code: 502, content: `rate limiter keep receiving ${code} from upstream`});
				else
					setTimeout(() => this.queue({args: savedArgs, retry: retry + 1, resolve, reject, urgent: true}), 500 + Math.floor(Math.random()*1000*retry))
			}
			req.on('response', (resp) => {

				if(checkAbort(option?.signal))
					return;
				if(resp.statusCode >= 300) {
					doRetry(resp.statusCode);
					return;
				}
				console.log(args[0], 'respond');
				resp.on('end', () => {
					console.log(args[0], 'end')
					upstream.history.set(startT, new Date().getTime())
				})
				resolve(resp)
			})
			req.on('error', e => {
				if(req.destroyed)
					return;
				if(checkAbort(option?.signal))
					return;
				doRetry(e.code);
			})
			req.on('timeout', () => {
				if(checkAbort(option?.signal))
					return;
				console.log(args[0], 'timeout');
				req.destroy();
				doRetry(408)
			})
		} 
	}

	httpsRequest(...args) {
		//console.log('httpsRequest', args[0])
		return new Promise((resolve, reject) => {
			//console.log(`${args[0]} in queue`);
			this.queue({args, retry: 0, resolve, reject});
		});		
	}
}
