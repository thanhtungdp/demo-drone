const mongoose = require('mongoose')
const AccessLog = require('models/AccessLog')
const Test = require('models/Test')
const User = require('models/User')
const {
  getQueryFromKey,
  getQueryFromTagKey
} = require('components/create-query-community')
const userAgent = require('useragent')
const testService = require('components/test-service-community')
const pagination = require('@bit/tungtung.micro.components.micro-crud/micro-crud/pagination')
const { testStatus } = require('../../constants')
const templateTestList = require('../../template')
const boom = require('boom')
const error = require('../../error')

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
    const test = await testService().updateAccessCount(req, testKey)
    ua.android =
      browser.indexOf('Dalvik') !== -1 || browser.indexOf('Android') !== -1
    ua.iOS = browser.indexOf('iPhone') !== -1
    const data = {
      ip,
      browser,
      data: ua,
      test
    }
    const asscessLog = await AccessLog.create(data, user)
    return asscessLog
  },

  getTestDetail: async req => {
    const query = getQueryFromKey(req.params.testKey)
    const test = await Test.findOne(query)
    return test
  },
  getTestOnlyView: async req => {
    const query = getQueryFromKey(req.params.testKey)
    const test = await Test.findOne(query).select({ questions: 0 })
    if (!test) {
      throw boom.notAcceptable(error.TEST_NOT_FOUND, {
        name: error.TEST_NOT_FOUND
      })
    }
    return test
  },
  getTestPlay: async req => {
    const query = getQueryFromKey(req.params.testKey)
    const test = await Test.findOne(query).select({
      'questions.correctAnswer': 0
    })
    return test
  },
  getTestList: pagination(async req => {
    const query = { status: { $in: [testStatus.NEW, testStatus.OLD] } }
    return templateTestList(req, query)
  }),

  getTestListByFollowed: pagination(async req => {
    let user = await User.findOne({
      _id: mongoose.Types.ObjectId(req.user._id)
    })
    let query
    query = {
      $or: [
        { 'owner._id': { $in: [user.following] } },
        { 'tags._id': { $in: [user.followedTags] } }
      ],
      status: { $in: [testStatus.NEW, testStatus.OLD] }
    }
    let testList = await templateTestList(req, query)
    if (testList.total === 0) {
      query = {
        status: { $in: [testStatus.NEW, testStatus.OLD] }
      }
      testList = await templateTestList(req, query)
    }
    return testList
  }),
  getTestListByTag: pagination(async req => {
    let query = {
      $and: [
        getQueryFromTagKey(req.params.tagKey),
        { status: { $in: [testStatus.NEW, testStatus.OLD] } }
      ]
    }
    return templateTestList(req, query)
  }),
  getTestListByPlayed: pagination(async req => {
    const query = { 'usersPlayed._id': mongoose.Types.ObjectId(req.user._id) }
    return templateTestList(req, query)
  }),
  getTestListByPlaying: pagination(async req => {
    let testId = await AccessLog.distinct('test._id', {
      'owner._id': req.user._id
    })
    testId = testId.map(id => mongoose.Types.ObjectId(id))
    let query = {
      'usersPlayed._id': { $ne: mongoose.Types.ObjectId(req.user._id) },
      totalQuestions: { $gt: 0 },
      _id: { $in: testId }
    }
    return templateTestList(req, query)
  }),
  bookmarkTest: async req => {
    const query = getQueryFromKey(req.params.testKey)
    let test = await Test.saveBookmarker(query, req.user)
    return test
  },
  unBookmarkTest: async req => {
    const query = getQueryFromKey(req.params.testKey)
    let test = await Test.deleteBookmarker(query, req.user)
    return test
  },
  checkBookmarked: async req => {
    const query = {
      $and: [
        getQueryFromKey(req.params.testKey),
        { 'bookmarker._id': req.user._id }
      ]
    }
    let test = await Test.findOne(query)
    return {
      isBookmarked: !!test
    }
  },
  getTestCheckBookmark: async req => {
    let testList = await Test.aggregate([
      {
        $project: {
          bookmarkerIds: {
            $map: { input: '$bookmarker', as: 'bmk', in: '$$bmk._id' }
          }
        }
      },
      {
        $project: {
          isBookmarked: { $in: [req.user._id, '$bookmarkerIds'] }
        }
      }
    ])
    return testList
  }
}
