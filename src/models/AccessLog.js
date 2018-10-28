const { Schema } = require('mongoose')
const { createModelSimple } = require('@bit/tungtung.micro.components.mongo')

const AccessLogSchema = new Schema({
  owner: {},
  quizList: {},
  ip: String,
  browser: String,
  data: {
    version: String,
    webkit: Boolean,
    opera: Boolean,
    ie: Boolean,
    chrome: Boolean,
    safari: Boolean,
    mobile_safari: Boolean,
    firefox: Boolean,
    mozilla: Boolean,
    android: Boolean
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
})

module.exports = createModelSimple(
  {
    name: 'accesslogs',
    schema: AccessLogSchema
  },
  {
    create: function (data, owner) {
      const accessLog = new this({
        ...data,
        owner: owner
      })
      return accessLog.save()
    }
  }
)

AccessLogSchema.virtual('id').get(function () {
  return this._id
})

AccessLogSchema.set('toJSON', { virtuals: true })
