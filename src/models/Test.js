const { Schema } = require('mongoose')
const { createModelSimple } = require('@bit/tungtung.micro.components.mongo')
const { slug } = require('@bit/tungtung.micro.components.mongo-slug')
const { testStatus } = require('../constants')

const TestSchema = new Schema({
  title: String,
  slug: String,
  time: Number,
  featuredImage: String,
  accessCount: {
    type: Number,
    default: 0
  },
  description: String,
  tags: [{}],
  mode: {
    type: String,
    default: 'PUBLIC'
  }, // PUBLIC or PRIVATE
  isCustomRank: {
    type: Boolean,
    default: false
  }, // true or false
  customRank: [{}],
  type: {
    type: String,
    default: 'OFFLINE'
  }, // ONLINE or OFFLINE
  openingTime: Date,
  closingTime: Date,
  showResultTime: Date,
  password: String, // password access test
  status: String, // NEW - OLD - NEED_REVIEW - REJECTED
  pdfFile: String,
  totalQuestions: {
    type: Number,
    default: 0
  },
  category: {},
  questions: [{}],
  owner: {},
  managers: [{}],
  editors: [{}],
  viewers: [{}],
  buyers: [{}],
  bookmarker: [{}],
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
  price: {
    type: Number,
    default: 0
  },
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
      const test = new this({
        ...data,
        slug: slug(data.title, true),
        searchField: slug(data.title, false, ' ').toLowerCase(),
        owner: owner,
        status: testStatus.DRAFT,
        step: 2
      })
      return test.save()
    },
    update: function (query = {}, data) {
      let fields = {}
      if (data.title) {
        fields.searchField = slug(data.title, false, ' ').toLowerCase()
      }
      if (!data.status) {
        fields.status = testStatus.DRAFT
      }
      return this.findOneAndUpdate(
        query,
        {
          $set: {
            ...data,
            ...fields,
            updatedAt: new Date()
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
          $addToSet: { usersPlayed: player }
        },
        { new: true }
      )
    },
    saveBookmarker: function (query = {}, player) {
      return this.findOneAndUpdate(
        query,
        {
          $addToSet: { bookmarker: player }
        },
        { new: true }
      )
    },
    deleteBookmarker: function (query = {}, player) {
      return this.findOneAndUpdate(
        query,
        {
          $pull: { bookmarker: player }
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
