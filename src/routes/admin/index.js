const Joi = require('joi')
const QuizList = require('models/QuizList')
const { json } = require('micro')
const validation = require('@bit/tungtung.micro.components.micro-joi')

module.exports = {
  create: validation(
    Joi.object({
      title: Joi.string().required(),
      time: Joi.number().required(),
      description: Joi.string().required(),
      quizzes: Joi.array().required(),
      price: Joi.number()
    })
  )(async req => {
    const body = await json(req)
    const data = {
      ...body,
      totalQuestions: body.quizzes.length
    }
    const quizList = await QuizList.create(data, req.user)
    return quizList
  })
}
