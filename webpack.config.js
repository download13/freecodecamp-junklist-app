module.exports = [
    {
        entry: './client/index.js',
        output: {
            path: __dirname + '/public',
            filename: 'app.js'
        },
        module: {
            loaders: [
                {
                    test: /\.js$/,
                    loader: 'babel-loader',
                    exclude: /node_modules/,
                    query: {
                        presets: ['babel-preset-es2015'],
                        plugins: [
                            'babel-plugin-syntax-jsx',
                            ['babel-plugin-transform-react-jsx', {pragma: 'element'}],
                            'babel-plugin-transform-object-rest-spread'
                        ]
                    }
                },
                {
                    test: /\.css$/,
                    loaders: ['style-loader', 'css-loader']
                }
            ]
        }
    },
    {
        entry: './server/index.js',
        output: {
            path: __dirname + '/dist',
            filename: 'server.js'
        },
        module: {
            loaders: [
                {
                    test: /\.js$/,
                    loader: 'babel-loader',
                    exclude: /node_modules/,
                    query: {
                        presets: ['babel-preset-es2015'],
                        plugins: ['babel-plugin-transform-object-rest-spread']
                    }
                }
            ]
        },
        target: 'node',
        externals: [
            'express',
            'socket.io',
            'sharp',
            'body-parser'
        ]
    }
];
