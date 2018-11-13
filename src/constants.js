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
        isBookmarked: { $in: [req.user.id, '$bookmarker'] },
        isManagers: { $in: [req.user.id, '$managers'] },
        isEditors: { $in: [req.user.id, '$editors'] },
        isViewers: { $in: [req.user.id, '$viewers'] },
        isBuyers: { $in: [req.user.id, '$buyers'] },
        isSubmited: { $in: [req.user.id, '$usersPlayed'] }
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
