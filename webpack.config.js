const { LoadBundleTask } = require('firebase/firestore')
const path = require('path')

module.exports = {
    mode:'development',
    entry: './src/index.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.js'
    },
    experiments: {
        topLevelAwait: true
      },
    watch: true
}