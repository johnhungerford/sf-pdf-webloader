module.exports = {
    entry: "./src/main.js",
    output: {
        path: __dirname + '/public/javascripts/',
        filename: "sf-pdf-webloader.js"
    },
    mode: 'production',
    module: {
        rules: [
          {
            test: /\.(js|jsx)$/,
            exclude: /node_modules/,
            use: {
              loader: "babel-loader"
            }
          }
        ]
      }
  }
  