import {BundleAnalyzerPlugin} from 'webpack-bundle-analyzer';
import * as webpack from "webpack";
import * as path from "path";
import { CheckerPlugin } from "awesome-typescript-loader";
import { AutoWebPlugin, WebPlugin } from "web-webpack-plugin";
import * as CopyWebpackPlugin from "copy-webpack-plugin";
import * as fs from 'fs';

declare var __dirname;

var nbgv = require('nerdbank-gitversioning')
nbgv.getVersion()
    .then(r => fs.writeFileSync('dist/data/version-info.json', JSON.stringify(r, null, 2),"utf8"))
    .catch(e => console.error(e));

const config: webpack.Configuration = {
  entry : {
    main      : path.resolve(__dirname, 'src/map.ts')
  },
  output: {
    path    : path.resolve(__dirname, 'dist'),
    filename: '[name]-subnautica-map.bundle.js'
  },

  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],

    // Speed up incremental builds by splitting
    // node modules into separate chunks.
    modules: [
      path.resolve('./'),
      path.resolve('./node_modules'),
    ]
  },

  // Source maps support ('inline-source-map' also works)
  devtool: 'source-map',

  // Add the loader for .ts files.
  module : {
    rules: [
      {
        test: /\.tsx?$/,
        include: path.resolve(__dirname, "src"),
        exclude: /node_modules/,
        use : {
          loader: "awesome-typescript-loader"
        }
      }
    ]
  },
  plugins: [
    // new BundleAnalyzerPlugin({
    //                            analyzerMode: 'static'
    //                          }),
    new CheckerPlugin(),
    //new ExtractTextPlugin('[name].css'),
    new WebPlugin({
                    // file name for output file, required.
                    // pay attention not to duplication of name,as is will cover other file
                    filename: 'index.html',
                    // this html's requires entry,must be an array.dependent resource will inject into html use the
                    // order entry in array.
                    requires: ['main', 'node-static'],
                    template: path.resolve(__dirname, 'index.html')
                  }),
    new CopyWebpackPlugin([{ from: 'data', to: 'data' }]),

    new webpack.optimize.CommonsChunkPlugin({
                                              name: 'node-static',
                                              filename: 'node-static.js',
                                              minChunks(module, count) {
                                                const context = module.context;
                                                return context && context.indexOf('node_modules') >= 0;
                                              },
                                            }),
  ]
};

export default config;
