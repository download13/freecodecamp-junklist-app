import rethinkdbdash from 'rethinkdbdash';


const r = rethinkdbdash({db: 'junk'});

const nop = () => {};

function either(promise, handler) {
    return promise.then(handler, handler);
}

export function setupDatabase() {
    return either(r.dbCreate('junk').run(), () => {
        return Promise.all([
            either(r.tableCreate('users', {primaryKey: 'email'}).run(), () => Promise.all([
                either(r.table('users').indexCreate('id').run(), nop)
            ])),
            //r.table('items').delete().run();
            either(r.tableCreate('items').run(), () => Promise.all([
                r.table('items').indexCreate('timeAdded').run().then(nop, nop),
                either(r.table('items').indexCreate('owner').run(), nop),
                r.table('items').insert(require('./MOCK_DATA.json')).run().then(nop, nop)
            ])),
            either(r.tableCreate('item_images').run(), nop),
            either(r.tableCreate('requests').run(), () => Promise.all([
                either(r.table('requests').indexCreate('requester').run(), nop),
                either(r.table('requests').indexCreate('itemOwner').run(), nop),
                either(r.table('requests').indexCreate('item').run(), nop)
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
