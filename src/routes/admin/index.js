const Joi = require('joi')
const QuizList = require('models/QuizList')
const { json } = require('micro')
const validation = require('@bit/tungtung.micro.components.micro-joi')
const { getQueryFromKey } = require('components/create-query-community')

module.exports = {
  create: validation(
    Joi.object({
      _id: Joi.any().optional(),
      title: Joi.string().required(),
      description: Joi.string().required(),
      time: Joi.number().required(),
      tags: Joi.array(),
      mode: Joi.object().required(),
      rankType: Joi.object().required(),
      customRank: Joi.array(),
      quizzes: Joi.array().required(),
      type: Joi.object().required(),
      openingTime: Joi.date(),
      closingTime: Joi.date(),
      showResultTime: Joi.date(),
      password: Joi.string(),
      price: Joi.number()
    })
  )(async req => {
    const body = await json(req)
    const data = {
      ...body,
      totalQuestions: body.quizzes.length
    }
    let quizList
    if (body._id) {
      const { _id } = data
      delete data._id
      quizList = await QuizList.update(
        { _id },
        data,
        req.user
      )
    } else {
      quizList = await QuizList.create(data, req.user)
    }
    return quizList
  }),
  getTestForUpdate: async req => {
    const query = getQueryFromKey(req.params.testKey)
    let test = await QuizList.findOne(query).select({
      _id: 1,
      title: 1,
      description: 1,
      time: 1,
      tags: 1,
      mode: 1,
      rankType: 1,
      customRank: 1,
      quizzes: 1,
      type: 1,
      openingTime: 1,
      closingTime: 1,
      showResultTime: 1,
      password: 1
    })
    return test
  }
}
