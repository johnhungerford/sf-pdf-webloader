module.exports = {
    entry: "./src/main.js",
    output: {
        path: __dirname + '/public/javascripts/',
        filename: "sf-pdf-webloader.js"
    },
    watch: true,
    mode: 'development'
  }