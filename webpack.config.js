const path = require('path');

const filename = "vents";

module.exports = {
    mode: 'development',
    entry: `./webpack/${filename}.js`,
    output: {
        path: path.resolve(__dirname, 'assets/js'),
        filename: `${filename}.bundle.js`,
    },
    watch: true
};