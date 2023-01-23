import redis from 'redis';

const client = redis.createClient();

const STATUS = {
	DISCONN: 'disconnected',
	CONN: 'connected',
	ERR: 'error'
}

client.status = STATUS.DISCONN;
client.connect().then(() => client.status = STATUS.CONN);


export { client, STATUS };
export default client;
