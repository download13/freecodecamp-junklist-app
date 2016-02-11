import rethinkdbdash from 'rethinkdbdash';
import config from '../../config';


const r = rethinkdbdash({
	host: config.rethinkHost,
	cursor: true,
	db: config.rethinkDatabase
});

export default () => r;
