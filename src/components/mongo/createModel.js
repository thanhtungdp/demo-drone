const mongoose = require('mongoose')
const mongoosePaginate = require('mongoose-paginate')

function createModelDao (conn, name, schema, methods) {
  schema.plugin(mongoosePaginate)
  const Model = conn.models[name] ? conn.model(name) : conn.model(name, schema)
  return Object.assign(Model, methods)
}

function createDefaultDao ({ name, schema }, methods = {}, connFromFunc = null) {
  let conn = connFromFunc
  if (!connFromFunc) {
    conn = mongoose.connections[1] ? mongoose.connections[1] : null
  }
  if (!conn) {
    return {
      conn: newConn => {
        return createDefaultDao({ name, schema }, methods, newConn)
      }
    }
  } else {
    const defaultDao = createModelDao(conn, name, schema, methods)
    return Object.assign(defaultDao, {
      conn: newConn => {
        return createDefaultDao({ name, schema }, methods, newConn)
      }
    })
  }
}

module.exports = createDefaultDao
