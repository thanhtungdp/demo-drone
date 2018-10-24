const Joi = require('joi')
const QuizList = require('models/QuizList')
const { json } = require('micro')
const validation = require('@bit/tungtung.micro.components.micro-joi')
const { getQueryFromKey } = require('components/create-query-community')
const pagination = require('@bit/tungtung.micro.components.micro-crud/micro-crud/pagination')
const { testStatus } = require('../../constants')

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
    test = await QuizList.update(
      query,
      {
        ...body,
        status: testStatus.DRAFT
      },
      req.user
    )
  } else {
    // Create
    test = await QuizList.create(body, req.user)
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
    const updatedTest = await QuizList.update(
      query,
      {
        quizzes: body.questions,
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
    const updatedTest = await QuizList.update(
      query,
      {
        ...body,
        status: testStatus.NEED_REVIEW,
        step: 4
      },
      req.user
    )
    return updatedTest
  }),
  // create: validation(
  //   Joi.object({
  //     _id: Joi.any().optional(),
  //     title: Joi.string().required(),
  //     description: Joi.string().required(),
  //     time: Joi.number().required(),
  //     tags: Joi.array(),
  //     mode: Joi.string().required(),
  //     isCustomRank: Joi.boolean().required(),
  //     customRank: Joi.array(),
  //     quizzes: Joi.array().required(),
  //     type: Joi.string().required(),
  //     openingTime: Joi.date(),
  //     closingTime: Joi.date(),
  //     showResultTime: Joi.date(),
  //     password: Joi.string(),
  //     price: Joi.number(),
  //     step: Joi.number()
  //   })
  // )(async req => {
  //   const body = await json(req)
  //   console.log(body)
  //   const data = {
  //     ...body,
  //     totalQuestions: body.quizzes.length,
  //     status: body.step === 4 ? testStatus.NEED_REVIEW : testStatus.DRAFT
  //   }
  //   let testList
  //   if (body._id) {
  //     const { _id } = data
  //     delete data._id
  //     testList = await QuizList.update({ _id }, data, req.user)
  //   } else {
  //     testList = await QuizList.create(data, req.user)
  //   }
  //   return testList
  // }),
  getTestForUpdate: async req => {
    const query = getQueryFromKey(req.params.testKey)
    console.log(query)
    let test = await QuizList.findOne(query).select({
      _id: 1,
      title: 1,
      slug: 1,
      description: 1,
      time: 1,
      tags: 1,
      mode: 1,
      isCustomRank: 1,
      customRank: 1,
      quizzes: 1,
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
    let testList = await QuizList.paginate(query, options)
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
    let testList = await QuizList.paginate(query, options)
    return testList
  })
}
