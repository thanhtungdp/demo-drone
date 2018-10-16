const AccessLog = require('models/AccessLog')
const QuizList = require('models/QuizList')
const { getQueryFromKey } = require('components/create-query-community')
const userAgent = require('useragent')
const quizlistService = require('components/quizlist-service-community')
const pagination = require('@bit/tungtung.micro.components.micro-crud/micro-crud/pagination')

module.exports = {
  createAccessLog: async req => {
    const ip =
      req.headers['x-forwarded-for'] ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      req.connection.socket.remoteAddress
    var { quizListKey } = req.params
    var browser = req.headers['user-agent']
    var user = req.user
    var ua = userAgent.is(browser)
    const quizList = await quizlistService().updateAccessCount(req, quizListKey)
    ua.android =
      browser.indexOf('Dalvik') !== -1 || browser.indexOf('Android') !== -1
    ua.iOS = browser.indexOf('iPhone') !== -1
    const data = {
      ip,
      browser,
      data: ua,
      quizList
    }
    const asscessLog = await AccessLog.create(data, user)
    return asscessLog
  },

  getQuizlistDetail: async req => {
    const query = getQueryFromKey(req.params.quizListKey)
    const quizList = await QuizList.findOne(query)
    return quizList
  },
  getQuizlistOnlyView: async req => {
    const query = getQueryFromKey(req.params.quizListKey)
    const quizList = await QuizList.findOne(query).select({ quizzes: 0 })
    return quizList
  },
  getQuizlistPlay: async req => {
    const query = getQueryFromKey(req.params.quizListKey)
    const quizList = await QuizList.findOne(query).select({
      'quizzes.correctAnswer': 0
    })
    return quizList
  },
  getQuizLists: pagination(async req => {
    let query = {}
    let quizLists = await QuizList.paginate(query, req.pagination)
    return quizLists
  })
}
