require('babel-core/register')({
    presets: ['es2015'],
    plugins: ['babel-plugin-transform-object-rest-spread']
});

require('./index.js');