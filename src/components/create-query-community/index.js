const ObjectId = require('mongoose').Types.ObjectId

function isObjectId (idString) {
  return ObjectId.isValid(idString)
}

function getQueryFromKey (key) {
  return key
    ? isObjectId(key) ? { $or: [{ _id: key }, { slug: key }] } : { slug: key }
    : {}
}

function getQueryQuizListFromKey (key) {
  return key
    ? isObjectId(key)
      ? { $or: [{ 'quizList._id': key }, { 'quizList.slug': key }] }
      : { 'quizList.slug': key }
    : {}
}

module.exports.getQueryFromKey = getQueryFromKey
module.exports.getQueryQuizListFromKey = getQueryQuizListFromKey

module.exports = {
  getQueryFromKey,
  getQueryQuizListFromKey
}
