import webpack from "webpack";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import CompressionPlugin from "compression-webpack-plugin";
import CopyWebpackPlugin from "copy-webpack-plugin";
import {
  ModifySourcePlugin,
  ReplaceOperation,
} from "modify-source-webpack-plugin";
import path from "path";
import zlib from "zlib";
import { fileURLToPath } from "url";

// For __dirname replacement in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
/**
 * Webpack configuration details for use with Grunt.
 *
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2017
 * @license Apache-2.0
 */

const d = new Date();
const banner = `/**
 * CyberChef - The Cyber Swiss Army Knife
 *
 * @copyright Crown Copyright 2016-${d.getUTCFullYear()}
 * @license Apache-2.0
 *
 *   Copyright 2016-${d.getUTCFullYear()} Crown Copyright
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */`;

export default {
  watch: true,
  entry: {
    main: "./src/index.js",
  },
  mode: "development",
  output: {
    publicPath: "",
    globalObject: "this",
    assetModuleFilename: "assets/[hash][ext][query]",
  },
  optimization: {
    minimize: false,
  },
  plugins: [
    new webpack.ProvidePlugin({
      $: "jquery",
      jQuery: "jquery",
      log: "loglevel",
      // process and Buffer are no longer polyfilled in webpack 5 but
      // many of our dependencies expect them, so it is easiest to just
      // provide them everywhere as was the case in webpack 4-
      process: "process",
      Buffer: ["buffer", "Buffer"],
    }),
    new webpack.BannerPlugin({
      banner: banner,
      raw: true,
      entryOnly: true,
    }),
    new webpack.DefinePlugin({
      // Required by Jimp to improve loading speed in browsers
      "process.browser": "true",
    }),
    new MiniCssExtractPlugin({
      filename: "assets/[name].css",
    }),

    // new CompressionPlugin({
    //   filename: "[path][base].gz",
    //   algorithm: "gzip",
    //   test: /\.(js)$/,
    // }),
    // new CompressionPlugin({
    //   filename: "[path][base].br",
    //   algorithm: "brotliCompress",
    //   test: /\.(js)$/,
    //   compressionOptions: {
    //     params: {
    //       [zlib.constants.BROTLI_PARAM_QUALITY]: 11,
    //     },
    //   },
    // }),

    new CopyWebpackPlugin({
      patterns: [
        {
          context: "src/vendor/",
          from: "tesseract/**/*",
          to: "assets/",
        },
        {
          context: "node_modules/tesseract.js/",
          from: "dist/worker.min.js",
          to: "assets/tesseract",
        },
        {
          context: "node_modules/tesseract.js-core/",
          from: "tesseract-core.wasm.js",
          to: "assets/tesseract",
        },
        {
          context: "node_modules/node-forge/dist",
          from: "prime.worker.min.js",
          to: "assets/forge/",
        },
      ],
    }),
    new ModifySourcePlugin({
      rules: [
        {
          // Fix toSpare(0) bug in Split.js by avoiding gutter accomodation
          test: /split\.es\.js$/,
          operations: [
            new ReplaceOperation(
              "once",
              "if (pixelSize < elementMinSize)",
              "if (false)"
            ),
          ],
        },
      ],
    }),
  ],
  resolve: {
    extensions: [".mjs", ".js", ".json"], // Allows importing files without extensions
    alias: {
      jquery: "jquery/src/jquery",
    },
    fallback: {
      path: "path-browserify",
      crypto: "crypto-browserify",
      stream: "stream-browserify",
      zlib: "browserify-zlib",
      buffer: false,
      crypto: "crypto-browserify",
      stream: "stream-browserify",
      path: "path-browserify",
      // For Node.js core modules you want to polyfill:
      fs: false,
      net: false,
      tls: false,
      child_process: false,
      vm: false,
    },
  },
  module: {
    // argon2-browser loads argon2.wasm by itself, so Webpack should not load it
    noParse: /argon2\.wasm$/,
    rules: [
      {
        test: /node_modules[\\/]chi-squared[\\/]cdf\.js$/,
        use: [
          "babel-loader",
          {
            loader: "string-replace-loader",
            options: {
              search: "with (Math)",
              replace: "const {pow,exp,log,sqrt,PI} = Math;",
              flags: "g",
            },
          },
        ],
        enforce: "pre",
      },
      {
        test: /\.m?js$/,
        exclude: /node_modules\/(?!crypto-api|bootstrap)/,
        use: {
          loader: "babel-loader",
          options: {
            configFile: path.resolve(__dirname, "babel.config.js"),
            cacheDirectory: true,
            compact: false,
          },
        },
        resolve: {
          fullySpecified: false, // Add this for the loader specifically
        },
      },
      {
        test: /node-forge/,
        loader: "imports-loader",
        options: {
          additionalCode: "var jQuery = false;",
        },
      },
      {
        // Load argon2.wasm as base64-encoded binary file expected by argon2-browser
        test: /argon2\.wasm$/,
        loader: "base64-loader",
        type: "javascript/auto",
      },
      {
        test: /prime.worker.min.js$/,
        type: "asset/source",
      },
      {
        test: /bootstrap-material-design/,
        loader: "imports-loader",
        options: {
          imports: "default popper.js/dist/umd/popper.js Popper",
        },
      },
      {
        test: /blueimp-load-image/,
        loader: "imports-loader",
        options: {
          type: "commonjs",
          imports: "single min-document document",
        },
      },
      {
        test: /\.css$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              publicPath: "../",
            },
          },
          "css-loader",
          "postcss-loader",
        ],
      },
      {
        test: /\.(ico|eot|ttf|woff|woff2)$/,
        type: "asset/resource",
      },
      {
        test: /\.svg$/,
        type: "asset/inline",
      },
      {
        // Store font .fnt and .png files in a separate fonts folder
        test: /(\.fnt$|bmfonts\/.+\.png$)/,
        type: "asset/resource",
        generator: {
          filename: "assets/fonts/[name][ext]",
        },
      },
      {
        // First party images are saved as files to be cached
        test: /\.(png|jpg|gif)$/,
        exclude: /(node_modules|bmfonts)/,
        type: "asset/resource",
        generator: {
          filename: "images/[name][ext]",
        },
      },
      {
        // Third party images are inlined
        test: /\.(png|jpg|gif)$/,
        exclude: /web\/static/,
        type: "asset/inline",
      },
    ],
  },
  stats: {
    children: false,
    chunks: false,
    modules: false,
    entrypoints: false,
  },
  ignoreWarnings: [
    /source-map/,
    /source map/,
    /dependency is an expression/,
    /export 'default'/,
    /Can't resolve 'sodium'/,
  ],
  performance: {
    hints: false,
  },
};
