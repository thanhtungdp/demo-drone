const axios = require('axios')

async function findQuizList (service, req, quizListKey) {
  try {
    const dataRes = await axios.get(service + '/' + quizListKey, {
      headers: {
        common: {
          ...req.headers
        }
      }
    })
    return dataRes.data
  } catch (e) {
    throw e
  }
}

async function updateAccessCount (service, req, quizListKey) {
  try {
    const dataRes = await axios.get(
      service + '/' + quizListKey + '/access-count',
      {
        headers: {
          common: {
            ...req.headers
          }
        }
      }
    )
    return dataRes.data
  } catch (e) {
    throw e
  }
}

module.exports = (service = process.env.QUIZLIST_SERVICE) => {
  return {
    findQuizList: (req, quizListKey) => findQuizList(service, req, quizListKey),
    updateAccessCount: (req, quizListKey) =>
      updateAccessCount(service, req, quizListKey)
  }
}
