const AccessLog = require('models/AccessLog')
const QuizList = require('models/QuizList')
const { getQueryFromKey } = require('components/create-query-community')
const userAgent = require('useragent')
const testService = require('components/test-service-community')
const pagination = require('@bit/tungtung.micro.components.micro-crud/micro-crud/pagination')
const { testStatus } = require('../../constants')

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
    const quizList = await testService().updateAccessCount(req, testKey)
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
    const test = await QuizList.findOne(query)
    return test
  },
  getTestOnlyView: async req => {
    const query = getQueryFromKey(req.params.testKey)
    const test = await QuizList.findOne(query).select({ quizzes: 0 })
    return test
  },
  getTestPlay: async req => {
    const query = getQueryFromKey(req.params.testKey)
    const test = await QuizList.findOne(query).select({
      'quizzes.correctAnswer': 0
    })
    return test
  },
  getTestList: pagination(async req => {
    const query = { status: { $in: [testStatus.NEW, testStatus.OLD] } }
    const options = {
      sort: { createdAt: -1 },
      ...req.pagination
    }
    let testList = await QuizList.paginate(query, options)
    return testList
  }),
  getTestListByPlayed: pagination(async req => {
    const query = {
      'usersPlayed._id': req.user._id,
      status: { $in: [testStatus.NEW, testStatus.OLD] }
    }
    const options = {
      sort: { createdAt: -1 },
      ...req.pagination
    }
    let testList = await QuizList.paginate(query, options)
    return testList
  }),
  getTestListByPlaying: pagination(async req => {
    let testId = await AccessLog.distinct('quizList._id', {
      'owner._id': req.user._id
    })
    const options = {
      sort: { createdAt: -1 },
      ...req.pagination
    }
    let query = {
      'usersPlayed._id': { $nin: [req.user._id] },
      totalQuestions: { $gt: 0 },
      _id: { $in: testId }
    }
    let testList = await QuizList.paginate(query, options)
    return testList
  })
}
