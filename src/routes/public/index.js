const Test = require('models/Test')
const pagination = require('@bit/tungtung.micro.components.micro-crud/micro-crud/pagination')
const mongoose = require('mongoose')
const templateTestList = require('../../template')
const { testMode, testStatus } = require('../../constants')
const { getQueryFromTagKey, getQueryFromKey } = require('components/create-query-community')
const testService = require('components/test-service-community')
const boom = require('boom')
const error = require('../../error')

function getQueryById (value, keyBefore, keyId) {
  if (mongoose.Types.ObjectId.isValid(value)) {
    return { [keyId]: value }
  } else return { [keyBefore]: value }
}

module.exports = {
  getTestListByUser: pagination(async req => {
    const query = {
      $and: [
        {
          mode: testMode.PUBLIC,
          $or: [getQueryById(req.params.username, 'owner.username', 'owner._id')]
        }
      ]
    }
    return templateTestList(req, query)
  }),
  getTestListByUserPlayed: pagination(async req => {
    const query = {
      'usersPlayed._id': mongoose.Types.ObjectId(req.params.username)
    }
    return templateTestList(req, query)
  }),
  getTestListHot: pagination(async req => {
    let data = await testService().getTestListHot(req)
    data = data.map(data => mongoose.Types.ObjectId(data._id.testId))
    let query = {
      _id: { $in: data },
      status: { $in: [testStatus.NEW, testStatus.OLD] }
    }
    return templateTestList(req, query)
  }),
  getTestListByTag: pagination(async req => {
    let query = {
      $and: [
        getQueryFromTagKey(req.params.tagKey),
        { status: { $in: [testStatus.NEW, testStatus.OLD] } }
      ]
    }
    return templateTestList(req, query)
  }),
  getTestOnlyView: async req => {
    const query = getQueryFromKey(req.params.testKey)
    const userId = req.user ? mongoose.Types.ObjectId(req.user._id) : ''
    let test = await Test.aggregate([
      { $match: query },
      {
        $project: {
          title: 1,
          slug: 1,
          time: 1,
          accessCount: 1,
          description: 1,
          tags: 1,
          mode: 1,
          isCustomRank: 1,
          customRank: 1,
          type: 1,
          openingTime: 1,
          closingTime: 1,
          showResultTime: 1,
          status: 1,
          pdfFile: 1,
          totalQuestions: 1,
          owner: 1,
          accessibility: 1,
          totalRatings: 1,
          ratingAvg: 1,
          searchField: 1,
          price: 1,
          isFree: 1,
          step: 1,
          createdAt: 1,
          updatedAt: 1,
          featuredImage: 1,
          isBookmarked: {
            $cond: {
              if: { $isArray: '$bookmarker' },
              then: {
                $in: [userId, '$bookmarker._id']
              },
              else: false
            }
          },
          isManagers: {
            $cond: {
              if: { $isArray: '$managers' },
              then: { $in: [userId, '$managers._id'] },
              else: false
            }
          },
          isEditors: {
            $cond: {
              if: { $isArray: '$editors' },
              then: { $in: [userId, '$editors._id'] },
              else: false
            }
          },
          isViewers: {
            $cond: {
              if: { $isArray: '$viewers' },
              then: { $in: [userId, '$viewers._id'] },
              else: false
            }
          },
          isBuyers: {
            $cond: {
              if: { $isArray: '$buyers' },
              then: { $in: [userId, '$buyers._d'] },
              else: false
            }
          },
          isSubmited: {
            $cond: {
              if: { $isArray: '$usersPlayed' },
              then: {
                $in: [userId, '$usersPlayed._id']
              },
              else: false
            }
          }
        }
      }
    ])
    if (!test) {
      throw boom.notAcceptable(error.TEST_NOT_FOUND, {
        name: error.TEST_NOT_FOUND
      })
    }
    return test[0]
  }
}
