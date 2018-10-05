const { Schema } = require('mongoose')
const createModel = require('@bit/tungtung.micro.components.mongo/createModel')
const { slug } = require('@bit/tungtung.micro.components.mongo-slug')

const QuizListSchema = new Schema({
  title: String,
  slug: String,
  time: Number,
  accessCount: {
    type: Number,
    default: 0
  },
  description: String,
  status: String,
  pdfFile: String,
  totalQuestions: Number,
  category: {},
  quizzes: [{}],
  owner: {},
  managers: [{}],
  editors: [{}],
  viewers: [{}],
  buyers: [{}],
  accessibility: String,
  usersPlayed: [{}],
  totalRatings: {
    type: Number,
    default: 0
  },
  ratingAvg: {
    type: Number,
    default: 0
  },
  searchField: String,
  price: Number,
  isFree: Boolean,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
})

QuizListSchema.methods.updateAccessCount = function () {
  this.accessCount = this.accessCount + 1
  return this.save()
}

module.exports = createModel(
  {
    name: 'quizlists',
    schema: QuizListSchema
  },
  {
    create: function (data, owner) {
      const quizlist = new this({
        ...data,
        slug: slug(data.title, true),
        searchField: slug(data.title, false, ' ').toLowerCase(),
        owner: owner
      })
      return quizlist.save()
    },
    list: function (query = {}) {
      return this.findOne(query)
    }
  }
)

QuizListSchema.virtual('id').get(function () {
  return this._id
})

QuizListSchema.set('toJSON', { virtuals: true })
