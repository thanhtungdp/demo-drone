const QuizList = require('models/QuizList')
const AccessLog = require('models/AccessLog')
const {
  getQueryFromKey,
  getQueryQuizlistFromKey
} = require('components/create-query')

module.exports = {
  getQuizListItem: async req => {
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
    const query = getQueryFromKey(req.params.contestKey)
    const quizlist = await QuizList.findOne(query)
    quizlist.updateAccessCount()
    return {
      id: quizlist.id,
      _id: quizlist._id,
      slug: quizlist.slug,
      title: quizlist.title,
      time: quizlist.time,
      description: quizlist.description,
      totalQuestions: quizlist.totalQuestions,
      searchField: quizlist.searchField,
      owner: quizlist.owner
    }
  },
  getAccessLog: async req => {
    const query = getQueryQuizlistFromKey(req.params.contestKey)
    const accessLog = await AccessLog.findOne(query)
    return accessLog
  }
}
