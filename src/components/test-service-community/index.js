const axios = require('axios')

async function findTest (service, req, testKey) {
  try {
    const dataRes = await axios.get(service + '/' + testKey, {
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

async function updateAccessCount (service, req, testKey) {
  try {
    const dataRes = await axios.get(service + '/' + testKey + '/access-count', {
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
async function updatePlayerSubmited (service, req, testKey) {
  try {
    const dataRes = await axios.get(service + '/' + testKey + '/submited', {
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
async function updateRating (service, req, testKey, data) {
  try {
    const dataRes = await axios.put(service + '/' + testKey + '/rating', data, {
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

module.exports = (service = process.env.TEST_SERVICE) => {
  return {
    findTest: (req, testKey) => findTest(service, req, testKey),
    updateAccessCount: (req, testKey) =>
      updateAccessCount(service, req, testKey),
    getAccessLog: (req, accessLogId) => getAccessLog(service, req, accessLogId),
    updatePlayerSubmited: (req, testKey) =>
      updatePlayerSubmited(service, req, testKey),
    updateRating: (req, testKey, data) =>
      updateRating(service, req, testKey, data)
  }
}
