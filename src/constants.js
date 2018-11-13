const Test = require('models/Test')

const testStatus = {
  DRAFT: 'DRAFT',
  NEW: 'NEW',
  OLD: 'OLD',
  REJECTED: 'REJECTED',
  NEED_REVIEW: 'NEED_REVIEW'
}
const templateTestList = async (req, query) => {
  let testList = await Test.aggregate([
    { $match: query },
    {
      $project: {
        title: 1,
        slug: 1,
        time: 1,
        accessCount: 1,
        description: String,
        tags: 1,
        mode: 1,
        isCustomRank: 1,
        customRank: 1,
        type: 1,
        openingTime: 1,
        closingTime: 1,
        showResultTime: 1,
        password: 1,
        status: String,
        pdfFile: String,
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
        bookmarkerIds: {
          $map: { input: '$bookmarker', as: 'bmk', in: '$$bmk._id' }
        },
        managerIds: {
          $map: { input: '$managers', as: 'bmk', in: '$$bmk._id' }
        },
        editorIds: {
          $map: { input: '$editors', as: 'bmk', in: '$$bmk._id' }
        },
        viewerIds: {
          $map: { input: '$viewers', as: 'bmk', in: '$$bmk._id' }
        },
        buyerIds: {
          $map: { input: '$buyers', as: 'bmk', in: '$$bmk._id' }
        },
        sumbitedIds: {
          $map: { input: '$usersPlayed', as: 'bmk', in: '$$bmk._id' }
        }
      }
    },
    {
      $project: {
        title: 1,
        slug: 1,
        time: 1,
        accessCount: 1,
        description: String,
        tags: 1,
        mode: 1,
        isCustomRank: 1,
        customRank: 1,
        type: 1,
        openingTime: 1,
        closingTime: 1,
        showResultTime: 1,
        password: 1,
        status: String,
        pdfFile: String,
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
        isBookmarked: { $in: [req.user._id, '$bookmarkerIds'] },
        isManagers: { $in: [req.user._id, '$managerIds'] },
        isEditors: { $in: [req.user._id, '$editorIds'] },
        isViewers: { $in: [req.user._id, '$viewerIds'] },
        isBuyers: { $in: [req.user._id, '$buyerIds'] },
        isSubmited: { $in: [req.user._id, '$sumbitedIds'] }
      }
    },
    { $limit: req.pagination.limit * req.pagination.page },
    { $skip: (req.pagination.page - 1) * req.pagination.limit },
    { $sort: { createdAt: -1 } }
  ])
  let total = await Test.count(query)
  let pages = await Math.ceil(total / req.pagination.limit)
  return { docs: testList, ...req.pagination, total, pages }
}

module.exports = {
  templateTestList: templateTestList,
  testStatus: testStatus
}
