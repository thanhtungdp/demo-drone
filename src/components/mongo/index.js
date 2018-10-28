const connect = require('./connect')
const connectSimple = require('./connectSimple')
const createModel = require('./createModel')
const createModelSimple = require('./createModelSimple')

module.exports.connect = connect
module.exports.connectSimple = connectSimple
module.exports.createModel = createModel
module.exports.createModelSimple = createModelSimple
module.exports = {
  connect,
  connectSimple,
  createModel,
  createModelSimple
}
