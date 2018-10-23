const ObjectId = require('mongoose').Types.ObjectId

function isObjectId (idString) {
  return ObjectId.isValid(idString)
}

function getQueryFromKey (key) {
  return key
    ? isObjectId(key) ? { $or: [{ _id: key }, { slug: key }] } : { slug: key }
    : {}
}

function getQueryTestFromKey (key) {
  return key
    ? isObjectId(key)
        ? { $or: [{ 'test._id': key }, { 'test.slug': key }] }
        : { 'test.slug': key }
    : {}
}

module.exports.getQueryFromKey = getQueryFromKey
module.exports.getQueryTestFromKey = getQueryTestFromKey

module.exports = {
  getQueryFromKey,
  getQueryTestFromKey
}
