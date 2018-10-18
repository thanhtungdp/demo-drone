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
    var { testKey } = req.params
    var browser = req.headers['user-agent']
    var user = req.user
    var ua = userAgent.is(browser)
    const quizList = await quizlistService().updateAccessCount(req, testKey)
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

  getTestDetail: async req => {
    const query = getQueryFromKey(req.params.testKey)
    const quizList = await QuizList.findOne(query)
    return quizList
  },
  getTestOnlyView: async req => {
    const query = getQueryFromKey(req.params.testKey)
    const quizList = await QuizList.findOne(query).select({ quizzes: 0 })
    return quizList
  },
  getTestPlay: async req => {
    const query = getQueryFromKey(req.params.testKey)
    const quizList = await QuizList.findOne(query).select({
      'quizzes.correctAnswer': 0
    })
    return quizList
  },
  getTestList: pagination(async req => {
    const query = { totalQuestions: { $gt: 0 } }
    const options = {
      sort: { createdAt: -1 }
    }
    let quizLists = await QuizList.paginate(query, options, req.pagination)
    return quizLists
  }),
  getTestListtByPlayed: pagination(async req => {
    const query = {
      'usersPlayed._id': req.user._id,
      totalQuestions: { $gt: 0 }
    }
    const options = {
      sort: { createdAt: -1 }
    }
    let testList = await QuizList.paginate(query, options, req.pagination)
    return testList
  }),
  getTestListByPlaying: pagination(async req => {
    let testId = await AccessLog.distinct('quizList._id', {
      'owner._id': req.user._id
    })
    const options = {
      sort: { createdAt: -1 }
    }
    let query = {
      $and: [
        {
          'usersPlayed._id': { $nin: [req.user._id] },
          totalQuestions: { $gt: 0 }
        },
        { _id: { $in: testId } }
      ]
    }
    let testList = await QuizList.paginate(query, options, req.pagination)
    return testList
  })
}
