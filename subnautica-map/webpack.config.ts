import * as webpack from "webpack";
import * as path from "path";
import { CheckerPlugin } from "awesome-typescript-loader";
import { AutoWebPlugin, WebPlugin } from "web-webpack-plugin";
import * as ExtractTextPlugin from "extract-text-webpack-plugin";
import * as CopyWebpackPlugin from "copy-webpack-plugin";

declare var __dirname;

const config: webpack.Configuration = {
  entry : {
    main      : path.resolve(__dirname, 'src/map.ts')
  },
  output: {
    path    : path.resolve(__dirname, 'dist'),
    filename: '[name]-subnautica-map.bundle.js'
  },

  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx']
  },

  // Source maps support ('inline-source-map' also works)
  devtool: 'source-map',

  // Add the loader for .ts files.
  module : {
    rules: [
      {
        test: /\.tsx?$/,
        use : {
          loader: "awesome-typescript-loader"
        }
      },
      // {
      //   test: /\.css$/,
      //   exclude: /\/\//,
      //   use : ExtractTextPlugin.extract({
      //                                          fallback: "style-loader",
      //                                          use: "css-loader"
      //                                        })
      // },
      {
        test: /\.(png|jpg|svg)$/,
        use: 'file-loader'
      }
    ]
  },
  plugins: [
    new CheckerPlugin(),
    //new ExtractTextPlugin('[name].css'),
    new WebPlugin({
                    // file name for output file, required.
                    // pay attention not to duplication of name,as is will cover other file
                    filename: 'index.html',
                    // this html's requires entry,must be an array.dependent resource will inject into html use the
                    // order entry in array.
                    requires: ['main'],
                    template: path.resolve(__dirname, 'index.html')
                  }),
    new CopyWebpackPlugin([{ from: 'data', to: 'data' }])
  ]
};

export default config;
