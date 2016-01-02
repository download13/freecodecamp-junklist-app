import rethinkdbdash from 'rethinkdbdash';


const r = rethinkdbdash({cursor: true, db: 'junk'});

export default () => r;
