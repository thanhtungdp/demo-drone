const Test = require('models/Test')
const pagination = require('@bit/tungtung.micro.components.micro-crud/micro-crud/pagination')

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
  })
}
