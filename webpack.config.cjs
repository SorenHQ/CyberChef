const webpack = require("webpack");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CompressionPlugin = require("compression-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const {
  ModifySourcePlugin,
  ReplaceOperation,
} = require("modify-source-webpack-plugin");
const path = require("path");
const zlib = require("zlib");

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

module.exports = {
  mode: "production",
  entry: {
    main: "./src/index.js",
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "main.js",
    publicPath: "",
    globalObject: "this",
    assetModuleFilename: "assets/[hash][ext][query]",
  },
  optimization: {
    minimize: true,
  },
  bail: false, // Continue building even if there are errors
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
    new CompressionPlugin({
      filename: "[path][base].gz",
      algorithm: "gzip",
      test: /\.(js)$/,
    }),
    new CompressionPlugin({
      filename: "[path][base].br",
      algorithm: "brotliCompress",
      test: /\.(js)$/,
      compressionOptions: {
        params: {
          [zlib.constants.BROTLI_PARAM_QUALITY]: 11,
        },
      },
    }),
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
        {
          // Fix crypto-api .mjs imports by adding extensions
          test: /crypto-api.*\.mjs$/,
          operations: [
            new ReplaceOperation("all", 'from "./hasher/has160"', 'from "./hasher/has160.mjs"'),
            new ReplaceOperation("all", 'from "./hasher/md2"', 'from "./hasher/md2.mjs"'),
            new ReplaceOperation("all", 'from "./hasher/md4"', 'from "./hasher/md4.mjs"'),
            new ReplaceOperation("all", 'from "./hasher/md5"', 'from "./hasher/md5.mjs"'),
            new ReplaceOperation("all", 'from "./hasher/ripemd"', 'from "./hasher/ripemd.mjs"'),
            new ReplaceOperation("all", 'from "./hasher/sha0"', 'from "./hasher/sha0.mjs"'),
            new ReplaceOperation("all", 'from "./hasher/sha1"', 'from "./hasher/sha1.mjs"'),
            new ReplaceOperation("all", 'from "./hasher/sha256"', 'from "./hasher/sha256.mjs"'),
            new ReplaceOperation("all", 'from "./hasher/sha512"', 'from "./hasher/sha512.mjs"'),
            new ReplaceOperation("all", 'from "./hasher/snefru"', 'from "./hasher/snefru.mjs"'),
            new ReplaceOperation("all", 'from "./hasher/whirlpool"', 'from "./hasher/whirlpool.mjs"'),
            new ReplaceOperation("all", 'from "./encoder/utf"', 'from "./encoder/utf.mjs"'),
            new ReplaceOperation("all", 'from "./encoder/array-buffer"', 'from "./encoder/array-buffer.mjs"'),
            new ReplaceOperation("all", 'from "./encoder/hex"', 'from "./encoder/hex.mjs"'),
            new ReplaceOperation("all", 'from "./encoder/base64"', 'from "./encoder/base64.mjs"'),
            new ReplaceOperation("all", 'from "./mac/hmac"', 'from "./mac/hmac.mjs"'),
            new ReplaceOperation("all", 'from "./hasher32be"', 'from "./hasher32be.mjs"'),
            new ReplaceOperation("all", 'from "./hasher32le"', 'from "./hasher32le.mjs"'),
            new ReplaceOperation("all", 'from "./hasher8"', 'from "./hasher8.mjs"'),
            new ReplaceOperation("all", 'from "./hasher"', 'from "./hasher.mjs"'),
            new ReplaceOperation("all", 'from "../tools/tools"', 'from "../tools/tools.mjs"'),
          ],
        },
      ],
    }),
  ],
  resolve: {
    extensions: [".mjs", ".js", ".json"], // Allows importing files without extensions
    fullySpecified: false, // Allow imports without file extensions for .mjs files
    extensionAlias: {
      ".js": [".mjs", ".js"],
    },
    alias: {
      jquery: "jquery/src/jquery",
    },
    fallback: {
      fs: false,
      child_process: false,
      net: false,
      tls: false,
      path: require.resolve("path/"),
      buffer: require.resolve("buffer/"),
      crypto: require.resolve("crypto-browserify"),
      stream: require.resolve("stream-browserify"),
      zlib: require.resolve("browserify-zlib"),
      process: false,
      vm: false,
    },
  },
  module: {
    // argon2-browser loads argon2.wasm by itself, so Webpack should not load it
    noParse: /argon2\.wasm$/,
    rules: [
      {
        test: /\.m?js$/,
        exclude: /node_modules\/(?!crypto-api|bootstrap)/,
        options: {
          configFile: path.resolve(__dirname, "babel.config.js"),
          cacheDirectory: true,
          compact: false,
        },
        type: "javascript/auto",
        loader: "babel-loader",
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
        exclude: /(web\/static|bmfonts)/,
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
    /Can't resolve.*\.mjs/,
    /Invalid generator object/,
  ],
  performance: {
    hints: false,
  },
};
