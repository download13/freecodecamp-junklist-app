import rethinkdb from './rethinkdb';
import config from '../../config';
import mockdata from './MOCK_DATA.json';

const r = rethinkdb();


function ig(promise, handler) {
	const r = promise
	.then(
        () => null,
        err => {
            if(err.stack.indexOf('already exists') === -1) {
                throw err;
            }
        }
    );

    if(handler) {
        return r.then(handler);
    }
    return r;
}

export function setupDatabase() {
	return ig(r.dbCreate(config.rethinkDatabase).run(), () => {
		return Promise.all([
			ig(r.tableCreate('users', {primaryKey: 'email'}).run()).then(() => Promise.all([
				ig(r.table('users').indexCreate('id').run())
			])),
			ig(r.tableCreate('items').run()).then(() => Promise.all([
				ig(r.table('items').indexCreate('timeAdded').run()),
				ig(r.table('items').indexCreate('owner').run()),
				ig(r.table('items').insert(mockdata, {conflict: 'replace'}).run())
			])),
			ig(r.tableCreate('item_images').run()),
			ig(r.tableCreate('requests').run()).then(() => Promise.all([
				ig(r.table('requests').indexCreate('requester').run()),
				ig(r.table('requests').indexCreate('itemOwner').run()),
				ig(r.table('requests').indexCreate('item').run())
			]))
		]);
	});
}


if(require.main === module) {
	setupDatabase().then(() => {
		console.log('Done');
		r.getPoolMaster().drain();
	});
}
