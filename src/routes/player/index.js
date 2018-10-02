const { quizList } = require('../../../data')

module.exports = {
  getQuizlistDetail: async req => {
    return quizList
  }
}
