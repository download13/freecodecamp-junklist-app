const dev = process.env.NODE_ENV !== 'production';

let config = {
	rethinkHost: 'localhost',
	rethinkDatabase: 'junklist_test',
	dev
}

// Production
if(!dev) {
	config = {
		rethinkHost: 'rethinkdb',
		rethinkDatabase: 'junklist'
	}
}


export default config;
