const dev = process.env.NODE_ENV !== 'production';

let config = {
	rethinkHost: 'localhost',
	dev
}

// Production
if(!dev) {
	config = {
		rethinkHost: 'rethinkdb'
	}
}


export default config;
