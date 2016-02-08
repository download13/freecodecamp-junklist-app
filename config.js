let config = {
	rethinkHost: 'localhost'
}

// Production
if(!dev) {
	config = {
		rethinkHost: 'b2c4d3746863' // TODO: For debugging only!
	}
}


export default config;
