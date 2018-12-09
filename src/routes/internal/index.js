const mongoose = require('mongoose')
const Test = require('models/Test')
const AccessLog = require('models/AccessLog')
const { json } = require('micro')
const { getQueryFromKey } = require('components/create-query-community')

module.exports = {
  getTestItem: async req => {
    const query = getQueryFromKey(req.params.testKey)
    const test = await Test.findOne(query)
    return test
  },
  getTestList: async req => {
    let body = await json(req)
    let query = { _id: { $in: body.testList } }
    let testList = await Test.find(query).select({
      questions: 0
    })
    return testList
  },
  getTestInfo: async req => {
    const query = getQueryFromKey(req.params.testKey)
    const test = await Test.findOne(query).select({
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
    return test
  },
  updateAccessCount: async req => {
    const query = getQueryFromKey(req.params.testKey)
    const test = await Test.findOne(query)
    test.updateAccessCount()
    return {
      id: test.id,
      _id: test._id,
      slug: test.slug,
      title: test.title,
      time: test.time,
      description: test.description,
      totalQuestions: test.totalQuestions,
      searchField: test.searchField,
      owner: test.owner
    }
  },
  getAccessLog: async req => {
    const query = getQueryFromKey(req.params.accessLogId)
    const accessLog = await AccessLog.findOne(query)
    return accessLog
  },
  updatePlayerSubmited: async req => {
    const query = getQueryFromKey(req.params.testKey)
    const test = await Test.savedUserSubmit(query, req.user)
    return test
  },
  updateInfoRating: async req => {
    let body = await json(req)
    const query = getQueryFromKey(req.params.testKey)
    let test = await Test.findOne(query)
    let data = {
      rating: body.rating
    }
    let rating = await test.updateInfoRating(data)
    return rating
  },
  updateInfoComment: async req => {
    let query = {
      $and: [
        {
          $or: [
            { 'questions._id': req.params.questionKey },
            { 'questions._id': mongoose.Types.ObjectId(req.params.questionKey) }
          ]
        },
        getQueryFromKey(req.params.testKey)
      ]
    }
    const comment = await Test.findOneAndUpdate(
      query,
      {
        $inc: { 'questions.$.totalComment': 1 }
      },
      { new: true }
    )
    return comment
  }
}
