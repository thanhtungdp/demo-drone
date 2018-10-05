const ObjectId = require('mongoose').Types.ObjectId

function isObjectId (idString) {
  return ObjectId.isValid(idString)
}

function getQueryFromKey (key) {
  return key
    ? isObjectId(key) ? { $or: [{ _id: key }, { slug: key }] } : { slug: key }
    : {}
}

function getQueryQuizlistFromKey (key) {
  return key
    ? isObjectId(key)
      ? { $or: [{ 'quizlist._id': key }, { 'quizlist.slug': key }] }
      : { 'quizlist.slug': key }
    : {}
}

module.exports.getQueryFromKey = getQueryFromKey
module.exports.getQueryQuizlistFromKey = getQueryQuizlistFromKey

module.exports = {
  getQueryFromKey,
  getQueryQuizlistFromKey
}
