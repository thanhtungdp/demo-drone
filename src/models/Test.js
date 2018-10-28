const { Schema } = require('mongoose')
const { createModelSimple } = require('@bit/tungtung.micro.components.mongo')
const { slug } = require('@bit/tungtung.micro.components.mongo-slug')

const TestSchema = new Schema({
  title: String,
  slug: String,
  time: Number,
  accessCount: {
    type: Number,
    default: 0
  },
  description: String,
  tags: [{}],
  mode: String, // PUBLIC or PRIVATE
  isCustomRank: Boolean, // true or false
  customRank: [{}],
  type: String, // ONLINE or OFFLINE
  openingTime: Date,
  closingTime: Date,
  showResultTime: Date,
  password: String, // password access test
  status: String,
  pdfFile: String,
  totalQuestions: Number,
  category: {},
  questions: [{}],
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
  step: {
    type: Number,
    default: 1
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
})

TestSchema.methods.updateAccessCount = function () {
  this.accessCount = this.accessCount + 1
  return this.save()
}
TestSchema.methods.updateRating = function (data = {}) {
  this.ratingAvg =
    (this.totalRatings * this.ratingAvg + data.rating) / (this.totalRatings + 1)
  this.totalRatings = this.totalRatings + 1
  return this.save()
}

module.exports = createModelSimple(
  {
    name: 'tests',
    schema: TestSchema
  },
  {
    create: function (data, owner) {
      const quizlist = new this({
        ...data,
        slug: slug(data.title, true),
        searchField: slug(data.title, false, ' ').toLowerCase(),
        owner: owner,
        step: 2
      })
      return quizlist.save()
    },
    update: function (query = {}, data, owner) {
      let fields = {}
      if (data.title) {
        fields.searchField = slug(data.title, false, ' ').toLowerCase()
      }
      return this.findOneAndUpdate(
        query,
        {
          $set: {
            ...data,
            ...fields,
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

TestSchema.virtual('id').get(function () {
  return this._id
})

TestSchema.set('toJSON', { virtuals: true })
