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

async function getAccessLog (service, req, accessLogId) {
  try {
    const dataRes = await axios.get(service + '/access-log/' + accessLogId, {
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
async function updatePlayerSubmited (service, req, quizListKey) {
  try {
    const dataRes = await axios.get(service + '/' + quizListKey + '/submited', {
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
async function updateRating (service, req, quizListKey, data) {
  try {
    const dataRes = await axios.put(
      service + '/' + quizListKey + '/rating',
      data,
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
      updateAccessCount(service, req, quizListKey),
    getAccessLog: (req, accessLogId) => getAccessLog(service, req, accessLogId),
    updatePlayerSubmited: (req, quizListKey) =>
      updatePlayerSubmited(service, req, quizListKey),
    updateRating: (req, quizListKey, data) =>
      updateRating(service, req, quizListKey, data)
  }
}
