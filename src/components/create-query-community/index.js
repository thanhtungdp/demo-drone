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

function getQueryUser (key) {
  return key
    ? {
      $or: [
        { 'player._id': key },
        { 'player.username': key },
        { 'owner._id': key },
        { 'owner.username': key }
      ]
    }
    : {}
}

module.exports.getQueryFromKey = getQueryFromKey
module.exports.getQueryTestFromKey = getQueryTestFromKey
module.exports.getQueryUser = getQueryUser

module.exports = {
  getQueryFromKey,
  getQueryTestFromKey,
  getQueryUser
}
