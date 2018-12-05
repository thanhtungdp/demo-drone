const Test = require('models/Test')
const pagination = require('@bit/tungtung.micro.components.micro-crud/micro-crud/pagination')
const { testStatus } = require('../../constants')
const { getQueryFromTagKey } = require('components/create-query-community')

module.exports = {
  getTestListHot: pagination(async req => {
    let query = {}
    let options = {
      select: { questions: 0 },
      sort: { createdAt: -1 },
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
    let options = {
      select: {
        title: 1,
        slug: 1,
        time: 1,
        accessCount: 1,
        description: 1,
        tags: 1,
        mode: 1,
        type: 1,
        openingTime: 1,
        closingTime: 1,
        showResultTime: 1,
        status: 1,
        pdfFile: 1,
        totalQuestions: 1,
        owner: 1,
        totalRatings: 1,
        ratingAvg: 1,
        searchField: 1,
        price: 1,
        isFree: 1,
        createdAt: 1,
        featuredImage: 1
      },
      sort: { createdAt: -1 },
      ...req.pagination
    }
    let testList = await Test.paginate(query, options)
    return testList
  })
}
