const mongoose = require('mongoose')
const Test = require('models/Test')

const templateTestList = async (req, query) => {
  let testList = await Test.aggregate([
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
              $in: [mongoose.Types.ObjectId(req.user._id), '$bookmarker._id']
            },
            else: false
          }
        },
        isManagers: {
          $cond: {
            if: { $isArray: '$managers' },
            then: { $in: [mongoose.Types.ObjectId(req.user._id), '$managers._id'] },
            else: false
          }
        },
        isEditors: {
          $cond: {
            if: { $isArray: '$editors' },
            then: { $in: [mongoose.Types.ObjectId(req.user._id), '$editors._id'] },
            else: false
          }
        },
        isViewers: {
          $cond: {
            if: { $isArray: '$viewers' },
            then: { $in: [mongoose.Types.ObjectId(req.user._id), '$viewers._id'] },
            else: false
          }
        },
        isBuyers: {
          $cond: {
            if: { $isArray: '$buyers' },
            then: { $in: [mongoose.Types.ObjectId(req.user._id), '$buyers._id'] },
            else: false
          }
        },
        isSubmited: {
          $cond: {
            if: { $isArray: '$usersPlayed' },
            then: {
              $in: [mongoose.Types.ObjectId(req.user._id), '$usersPlayed._id']
            },
            else: false
          }
        }
      }
    },
    { $sort: { createdAt: -1 } },
    { $limit: req.pagination.limit * req.pagination.page },
    { $skip: (req.pagination.page - 1) * req.pagination.limit }
  ])
  let total = await Test.count(query)
  let pages = await Math.ceil(total / req.pagination.limit)
  return { docs: testList, ...req.pagination, total, pages }
}

module.exports = templateTestList
