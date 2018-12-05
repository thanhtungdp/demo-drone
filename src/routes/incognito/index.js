const Test = require('models/Test')
const pagination = require('@bit/tungtung.micro.components.micro-crud/micro-crud/pagination')
const { testStatus } = require('../../constants')
const { getQueryFromTagKey } = require('components/create-query-community')

module.exports = {
  getTestListHot: pagination(async req => {
    let query = {}
    let options = {
      select: {
        questions: 0
      },
      sort: {
        createdAt: -1
      },
      ...req.pagination
    }
    let testList = await Test.paginate(query, options)
    return testList
  }),
  getTestListByTag: pagination(async req => {
    let query = {
      $and: [
        getQueryFromTagKey(req.params.tagKey),
        { status: { $in: [testStatus.NEW, testStatus.OLD] } }
      ]
    }
    return Test.paginate(query)
  })
}
