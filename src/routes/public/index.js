const pagination = require('@bit/tungtung.micro.components.micro-crud/micro-crud/pagination')
const mongoose = require('mongoose')
const templateTestList = require('../../template')
const { testMode } = require('../../constants')

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
  })
}
