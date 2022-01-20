import https from 'https';

export default class RateLimiter {
	constructor(rate = 20) {
		this.RATE_LIMIT_SEC = rate;
		this.RETRY = 3;
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
			upstream.queue.unshift({args: args, retry: retry + 1, resolve, reject});
		else
			upstream.queue.push({args: args, retry: retry + 1, resolve, reject});

		if(upstream.processing === null) {
			upstream.processing = setInterval(() => this.handleWaiting(upstream), 1000 / this.RATE_LIMIT_SEC);
		}
	}

	handleWaiting(upstream) {
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
			if(args.some(arg => arg.signal?.aborted)) {
				reject(new Error('abort'));
				return;
			}
			const req = https.get(...args);
			req.on('response', (resp) => {

				if(args.some(arg => arg.signal?.aborted)) {
					reject(new Error('abort'));
					return;
				}
				if(resp.statusCode >= 300) {
					console.log(args[0], ' returns ', resp.statusCode)
					if(retry >= this.RETRY)
						reject({code: 502, content: `rate limiter keep receiving ${resp.statusCode} from upstream`});
					else
						this.queue({args: savedArgs, retry: retry + 1, resolve, reject, urgent: true})
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
				if(args.some(arg => arg.signal?.aborted)) {
					reject(new Error('abort'));
					return;
				}
				console.log(`rate limiter ${ retry !== 0 ? `retry ${retry} ` : '' }error`, e.message)
				if(retry >= this.RETRY)
					reject({code: 502, content: `rate limiter keep receiving ${e.code} from upstream`});
				else
					this.queue({args: savedArgs, retry: retry + 1, resolve, reject, urgent: true})
			})
			if(upstream.queue.length === 0) {
				clearInterval(upstream.processing);
				upstream.processing = null;
			}
		} 
	}

	httpsRequest(...args) {
		console.log('httpsRequest', args[0])
		return new Promise((resolve, reject) => {
			//console.log(`${args[0]} in queue`);
			this.queue({args, retry: 0, resolve, reject});
		});		
	}
}
