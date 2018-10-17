const QuizList = require('models/QuizList')
const AccessLog = require('models/AccessLog')
const { json } = require('micro')
const { getQueryFromKey } = require('components/create-query-community')

module.exports = {
  getQuizListItem: async req => {
    const query = getQueryFromKey(req.params.quizListKey)
    const quizList = await QuizList.findOne(query)
    return quizList
  },
  getQuizListInfo: async req => {
    const query = getQueryFromKey(req.params.quizListKey)
    const quizList = await QuizList.findOne(query).select({
      id: 1,
      _id: 1,
      slug: 1,
      title: 1,
      time: 1,
      description: 1,
      totalQuestions: 1,
      searchField: 1,
      owner: 1
    })
    return quizList
  },
  updateAccessCount: async req => {
    const query = getQueryFromKey(req.params.quizListKey)
    const quizList = await QuizList.findOne(query)
    quizList.updateAccessCount()
    return {
      id: quizList.id,
      _id: quizList._id,
      slug: quizList.slug,
      title: quizList.title,
      time: quizList.time,
      description: quizList.description,
      totalQuestions: quizList.totalQuestions,
      searchField: quizList.searchField,
      owner: quizList.owner
    }
  },
  getAccessLog: async req => {
    const query = getQueryFromKey(req.params.accessLogId)
    const accessLog = await AccessLog.findOne(query)
    return accessLog
  },
  updatePlayerSubmited: async req => {
    const query = {
      $and: [
        getQueryFromKey(req.params.quizListKey),
        { 'usersPlayed._id': { $nin: [req.user._id] } }
      ]
    }
    const quizList = await QuizList.savedUserSubmit(query, req.user)
    return quizList
  },
  updateRating: async req => {
    let body = await json(req)
    const query = getQueryFromKey(req.params.quizListKey)
    let quizList = await QuizList.findOne(query)
    let data = {
      rating: body.rating
    }
    let rating = await quizList.updateRating(data)
    return rating
  }
}
