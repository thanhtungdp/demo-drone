const Joi = require('joi')
const Test = require('models/Test')
const { json } = require('micro')
const validation = require('@bit/tungtung.micro.components.micro-joi')
const { getQueryFromKey } = require('components/create-query-community')
const pagination = require('@bit/tungtung.micro.components.micro-crud/micro-crud/pagination')
const { testStatus } = require('../../constants')
const axios = require('axios')
const amqp = require('amqp')

const createTestOrUpdateTestInfo = validation(
  Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
    time: Joi.number().required(),
    tags: Joi.array(),
    mode: Joi.string().required(),
    isCustomRank: Joi.boolean().required(),
    customRank: Joi.array()
  })
)(async req => {
  const body = await json(req)
  let test
  if (req.params.testKey) {
    // Update
    const query = getQueryFromKey(req.params.testKey)
    test = await Test.update(
      query,
      {
        ...body,
        step: 2,
        status: testStatus.DRAFT
      },
      req.user
    )
  } else {
    // Create
    test = await Test.create(body, req.user)

    amqp.publish('TEST_CREATED', {
      user: req.user
    })
    /**
     * import data to elasticsearch
     */
  }
  return test
})

module.exports = {
  create: createTestOrUpdateTestInfo,
  updateTestInfo: createTestOrUpdateTestInfo,
  updateQuestions: validation(
    Joi.object({
      questions: Joi.array().required()
    })
  )(async req => {
    const body = await json(req)
    const query = getQueryFromKey(req.params.testKey)
    const updatedTest = await Test.update(
      query,
      {
        questions: body.questions,
        totalQuestions: body.questions.length,
        status: testStatus.DRAFT,
        step: 3
      },
      req.user
    )
    return updatedTest
  }),
  updateTestForm: validation(
    Joi.object({
      type: Joi.string().required(),
      openingTime: Joi.date(),
      closingTime: Joi.date(),
      showResultTime: Joi.date(),
      password: Joi.string(),
      price: Joi.number().required()
    })
  )(async req => {
    const body = await json(req)
    const query = getQueryFromKey(req.params.testKey)
    const updatedTest = await Test.update(
      query,
      {
        ...body,
        status: testStatus.NEED_REVIEW,
        step: 4
      },
      req.user
    )
    axios.post(
      process.env.SEARCH_SERVICE + '/quiz-list',
      {
        testList: updatedTest
      },
      {
        headers: {
          common: {
            ...req.headers
          }
        }
      }
    )
    return updatedTest
  }),
  submitForReview: async req => {
    // Gửi đề thi cho admin duyệt
    const query = getQueryFromKey(req.params.testKey)
    const updatedTest = await Test.update(
      query,
      {
        status: testStatus.NEED_REVIEW,
        step: 4
      },
      req.user
    )
    return updatedTest
  },
  getTestForUpdate: async req => {
    const query = getQueryFromKey(req.params.testKey)
    let test = await Test.findOne(query).select({
      _id: 1,
      title: 1,
      slug: 1,
      description: 1,
      time: 1,
      tags: 1,
      mode: 1,
      isCustomRank: 1,
      customRank: 1,
      questions: 1,
      type: 1,
      openingTime: 1,
      closingTime: 1,
      showResultTime: 1,
      password: 1,
      price: 1,
      step: 1,
      status: 1
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
  }),
  getTestBookmark: pagination(async req => {
    const options = {
      sort: { createdAt: -1 },
      ...req.pagination
    }
    let query = {
      'bookmarker._id': req.user._id
    }
    let testList = await Test.paginate(query, options)
    return testList
  })
}
