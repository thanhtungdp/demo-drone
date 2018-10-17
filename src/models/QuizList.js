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
  tags: [],
  mode: {}, // public or private
  rankType: {}, // auto or custom
  customRank: [],
  type: {}, // online or offline test
  openingTime: Date,
  closingTime: Date,
  showResultTime: Date,
  password: String, // password access test
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
QuizListSchema.methods.updateRating = function (data = {}) {
  this.ratingAvg =
    (this.totalRatings * this.ratingAvg + data.rating) / (this.totalRatings + 1)
  this.totalRatings = this.totalRatings + 1
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
    update: function (query = {}, data, owner) {
      return this.findOneAndUpdate(
        query,
        {
          $set: {
            ...data,
            slug: slug(data.title, true),
            searchField: slug(data.title, false, ' ').toLowerCase(),
            owner: owner
          }
        },
        { new: true }
      )
    },
    list: function (query = {}) {
      return this.find(query)
    },
    savedUserSubmit: function (query = {}, player) {
      return this.findOneAndUpdate(
        query,
        {
          $push: { usersPlayed: player }
        },
        { new: true }
      )
    }
  }
)

QuizListSchema.virtual('id').get(function () {
  return this._id
})

QuizListSchema.set('toJSON', { virtuals: true })
