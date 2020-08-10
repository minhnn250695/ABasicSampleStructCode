const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const webpack = require('webpack');
const Merge = require('webpack-merge');
const StringReplacePlugin = require("string-replace-webpack-plugin");
var ExtractTextWebpackPlugin = require('extract-text-webpack-plugin');
var CopyWebpackPlugin = require('copy-webpack-plugin');

var environmentConfig = function (env) {
    return require(`./webpack.config.${env}.js`)
};

var commonConfig = {
    entry: {
        app: './src/main.ts',
        polyfill: './polyfills.ts'
    },
    output: {
        path: path.resolve(__dirname, 'wwwroot'),
        filename: '[name].bundle.js'
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: [
                    {
                        loader: '@angularclass/hmr-loader'
                    },
                    {
                        loader: 'ng-router-loader',
                    },
                    {
                        loader: 'awesome-typescript-loader',
                        options: {
                            configFileName: './tsconfig.json',
                        }
                    },
                    {
                        loader: 'angular2-template-loader'
                    }
                ],
                exclude: [/\.(spec|e2e)\.ts$/]
            },
            {
                test: /\.html$/,
                use: 'raw-loader',
                exclude: ['./src/index.html']
            },
            {
                test: /\.css$/,
                use: [
                    { loader: 'to-string-loader' },
                    { loader: 'css-loader' }
                ]
            },
            {
                test: /\.scss$/,
                use: [
                    { loader: 'to-string-loader' },
                    { loader: 'css-loader' },
                    { loader: 'sass-loader' },
                ],
                // exclude: /(node_modules)/
            },
            {
                test: /\.(png|svg|jpg|gif)$/,
                use: [
                    'file-loader'
                ]
            },
            {
                test: /.(ttf|otf|eot|svg|woff(2)?)(\?[a-z0-9]+)?$/,
                use: [{
                    loader: 'file-loader',
                    options: {
                        name: '[name].[ext]',
                        outputPath: 'assets/fonts/'
                    }
                }]
            },
            {
                test: /bootstrap\/dist\/js\/umd\//,
                use: 'imports-loader?jQuery=jquery'
            }
        ]
    },
    devtool: 'inline-source-map',
    devServer: {
        contentBase: './wwwroot'
    },
    resolve: {
        extensions: ['.js', '.ts', '.html', '.css', '.scss']
    },
    plugins: [
        new CleanWebpackPlugin(['wwwroot']),
        new HtmlWebpackPlugin({
            template: './src/index.html'
        }),
        new ExtractTextWebpackPlugin("[name].css"),
        new webpack.optimize.CommonsChunkPlugin({
            name: 'vendors',
            filename: 'app.[name].js',
            minChunks: Infinity
        }),
        new webpack.ContextReplacementPlugin(
            /angular(\\|\/)core(\\|\/)@angular/,
            path.resolve(__dirname, '../src')
        ),
        // new webpack.ProvidePlugin({
        //     $: 'jquery',
        //     jQuery: 'jquery',
        //     'window.jQuery': 'jquery'
        // }),
        new CopyWebpackPlugin([{
            from: './src/assets',
            to: './assets',
            ignore: ['*.css', '*.scss']
        }
        ]),
        new StringReplacePlugin()
    ]
};

module.exports = function (env) {

    return Merge(commonConfig, environmentConfig(env));
};