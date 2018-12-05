const { Schema } = require('mongoose')
const { createModelSimple } = require('@bit/tungtung.micro.components.mongo')

const UserSchema = new Schema({
  username: {
    type: String,
    unique: true
  },
  email: {
    type: String,
    unique: true,
    required: true
  },
  fullName: String,
  password: String,
  phone: {
    code: String,
    number: String
  },
  avatar: {
    avatar: { type: String, default: '' },
    old: { type: Boolean, default: false }
  },
  introduction: String,
  profile: {
    cover: { type: String, default: '' },
    coverPosition: { type: Number, default: 50 }
  },
  statics: {
    totalTestCreated: { type: Number, default: 0 },
    totalFollowers: { type: Number, default: 0 },
    totalFollowing: { type: Number, default: 0 }
  },
  birthday: Date,
  role: {
    type: String,
    default: 'PLAYER'
  },
  active: {
    type: Object,
    default: {
      isActive: false,
      code: ''
    }
  },
  facebookID: String,
  googleID: String,
  gender: String,
  isOwner: {
    type: Boolean,
    default: false
  },
  privacy: {
    playedTest: {
      type: Boolean,
      default: false
    },
    activity: {
      type: Boolean,
      default: false
    },
    blog: {
      type: Boolean,
      default: false
    }
  },
  firstLogin: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now()
  },
  updatedAt: {
    type: Date,
    default: Date.now()
  },
  followers: {
    type: [{}],
    default: []
  },
  following: {
    type: [{}],
    default: []
  },
  fbFriendIds: {
    type: [String],
    default: []
  },
  followedTags: {
    type: [
      {
        _id: { type: Schema.ObjectId },
        name: String,
        slug: String,
        createdAt: Date
      }
    ],
    default: []
  }
})

UserSchema.virtual('id').get(function () {
  return this._id
})
UserSchema.set('toJSON', { virtuals: true })

module.exports = createModelSimple(
  {
    name: 'user',
    schema: UserSchema
  },
  {}
)
