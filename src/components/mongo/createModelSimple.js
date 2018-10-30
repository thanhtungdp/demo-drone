const mongoose = require('mongoose')
const mongoosePaginate = require('mongoose-paginate')

function createModelDao (conn, name, schema, methods) {
  schema.plugin(mongoosePaginate)
  const Model = conn.models[name] ? conn.model(name) : conn.model(name, schema)
  return Object.assign(Model, methods)
}

function createDefaultDao ({ name, schema }, methods = {}, connFromFunc = null) {
  const conn = mongoose
  if (!conn) {
    return {
      conn: conn => {
        return createDefaultDao({ name, schema }, methods, conn)
      }
    }
  } else {
    const defaultDao = createModelDao(conn, name, schema, methods)
    return Object.assign(defaultDao, {
      conn: conn => {
        return createDefaultDao({ name, schema }, methods, conn)
      }
    })
  }
}

module.exports = createDefaultDao
