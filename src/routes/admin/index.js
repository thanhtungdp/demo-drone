const Joi = require('joi')
const Test = require('models/Test')
const { json } = require('micro')
const validation = require('@bit/tungtung.micro.components.micro-joi')
const { getQueryFromKey } = require('components/create-query-community')
const pagination = require('@bit/tungtung.micro.components.micro-crud/micro-crud/pagination')
const { testStatus } = require('../../constants')

module.exports = {
  create: validation(
    Joi.object({
      _id: Joi.any().optional(),
      title: Joi.string().required(),
      description: Joi.string().required(),
      time: Joi.number().required(),
      tags: Joi.array(),
      mode: Joi.string().required().valid(['PUBLIC', 'PRIVATE']),
      customRank: Joi.array(),
      questions: Joi.array().required(),
      isCustomRank: Joi.boolean().required(),
      type: Joi.string().required().valid(['ONLINE', 'OFFLINE']),
      openingTime: Joi.date(),
      closingTime: Joi.date(),
      showResultTime: Joi.date(),
      password: Joi.string(),
      price: Joi.number(),
      step: Joi.number()
    })
  )(async req => {
    const body = await json(req)
    const data = {
      ...body,
      totalQuestions: body.questions.length,
      status: body.step === 4 ? testStatus.NEED_REVIEW : testStatus.DRAFT
    }
    let test
    if (body._id) {
      const { _id } = data
      delete data._id
      test = await Test.update({ _id }, data, req.user)
    } else {
      test = await Test.create(data, req.user)
    }
    return test
  }),

  getTestForUpdate: async req => {
    const query = getQueryFromKey(req.params.testKey)
    let test = await Test.findOne(query).select({
      _id: 1,
      title: 1,
      description: 1,
      time: 1,
      tags: 1,
      mode: 1,
      rankType: 1,
      customRank: 1,
      questions: 1,
      type: 1,
      openingTime: 1,
      closingTime: 1,
      showResultTime: 1,
      password: 1,
      price: 1,
      step: 1
    })
    return test
  },
  getTestListByCreated: pagination(async req => {
    const query = {
      $and: [
        { 'owner._id': req.user._id },
        { status: { $nin: [testStatus.DRAFT] } }
      ]
    }
    const options = {
      sort: { createdAt: -1 },
      ...req.pagination
    }
    let testList = await Test.paginate(query, options)
    return testList
  }),
  getTestListByDraft: pagination(async req => {
    const query = {
      $and: [{ 'owner._id': req.user._id }, { status: testStatus.DRAFT }]
    }
    const options = {
      sort: { createdAt: -1 },
      ...req.pagination
    }
    let testList = await Test.paginate(query, options)
    return testList
  })
}
