const Test = require('models/Test')
const pagination = require('@bit/tungtung.micro.components.micro-crud/micro-crud/pagination')
const mongoose = require('mongoose')
const templateTestList = require('../../template')
const { testMode, testStatus } = require('../../constants')
const {
  getQueryFromTagKey,
  getQueryFromKey
} = require('components/create-query-community')
const testService = require('components/test-service-community')
const boom = require('boom')
const error = require('../../error')

function getQueryById (value, keyBefore, keyId) {
  if (mongoose.Types.ObjectId.isValid(value)) {
    return { [keyId]: value }
  } else return { [keyBefore]: value }
}

module.exports = {
  getTestListByUser: pagination(async req => {
    const query = {
      $and: [
        {
          mode: testMode.PUBLIC,
          $or: [
            getQueryById(req.params.username, 'owner.username', 'owner._id')
          ]
        }
      ]
    }
    return templateTestList(req, query)
  }),
  getTestListByUserPlayed: pagination(async req => {
    const query = {
      'usersPlayed._id': mongoose.Types.ObjectId(req.params.username)
    }
    return templateTestList(req, query)
  }),
  getTestListHot: pagination(async req => {
    let data = await testService().getTestListHot(req)
    data = data.map(data => mongoose.Types.ObjectId(data._id.testId))
    console.log(data)
    let query = {
      _id: { $in: data },
      status: { $in: [testStatus.NEW, testStatus.OLD] }
    }
    return templateTestList(req, query)
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
  getTestOnlyView: async req => {
    const query = getQueryFromKey(req.params.testKey)
    const test = await Test.findOne(query).select({ questions: 0 })
    if (!test) {
      throw boom.notAcceptable(error.TEST_NOT_FOUND, {
        name: error.TEST_NOT_FOUND
      })
    }
    return test
  }
}
