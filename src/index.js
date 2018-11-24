const { router, get, post, put, del, withNamespace } = require('microrouter')
const { handleErrors } = require('@bit/tungtung.micro.components.micro-boom')
const createMiddlewareAuth = require('@bit/tungtung.micro.components.middleware-auth-community')
const cors = require('micro-cors')({ origin: '*' })
const config = require('config')
const { connectSimple } = require('@bit/tungtung.micro.components.mongo')
connectSimple(config.mongodbUrl)

const playerRoute = require('routes/user')
const adminRoute = require('routes/admin')
const internalRoute = require('routes/internal')

const adminNamespace = withNamespace(`/${config.serviceName}/admin`)
const userNamespace = withNamespace(`/${config.serviceName}/user`)

const authMiddleware = createMiddlewareAuth()

const composeMiddle = func => handleErrors(authMiddleware(func))

const routerConbine = (...args) => cors(router(...args))

module.exports = routerConbine(
  adminNamespace(
    // Create new test
    post('/', composeMiddle(adminRoute.create)),
    // Update test info
    put('/:testKey/test-info', composeMiddle(adminRoute.updateTestInfo)),
    // Update questions
    put('/:testKey/questions', composeMiddle(adminRoute.updateQuestions)),
    // Update test form
    put('/:testKey/test-form', composeMiddle(adminRoute.updateTestForm)),
    // Submit for review
    put(
      '/:testKey/submit-for-review',
      composeMiddle(adminRoute.submitForReview)
    ),
    del('/:testKey', composeMiddle(adminRoute.deleteTest)),
    get('/created', composeMiddle(adminRoute.getTestListByCreated)),
    get('/draft', composeMiddle(adminRoute.getTestListByDraft)),
    get('/bookmarked', composeMiddle(adminRoute.getTestBookmark)),
    get('/update/:testKey', composeMiddle(adminRoute.getTestForUpdate))
  ),
  userNamespace(
    get('/played', composeMiddle(playerRoute.getTestListByPlayed)),
    get('/playing', composeMiddle(playerRoute.getTestListByPlaying)),
    get('/bookmarked', composeMiddle(playerRoute.getTestCheckBookmark)),
    get('/:testKey/bookmark', composeMiddle(playerRoute.bookmarkTest)),
    get('/:testKey/un-bookmark', composeMiddle(playerRoute.unBookmarkTest)),
    get(
      '/:testKey/check-bookmarked',
      composeMiddle(playerRoute.checkBookmarked)
    ),
    get('/:testKey/access-log', composeMiddle(playerRoute.createAccessLog)),
    get('/:testKey/only-view', composeMiddle(playerRoute.getTestOnlyView)),
    get('/:testKey/play', composeMiddle(playerRoute.getTestPlay)),
    get('/:testKey', composeMiddle(playerRoute.getTestDetail)),
    get('/', composeMiddle(playerRoute.getTestList))
  ),
  get('/health', () => 'Working...'),
  post('/', composeMiddle(internalRoute.getTestList)),
  get('/access-log/:accessLogId', composeMiddle(internalRoute.getAccessLog)),
  get(
    '/:testKey/:questionKey/comment',
    composeMiddle(internalRoute.updateInfoComment)
  ),
  get('/:testKey/access-count', composeMiddle(internalRoute.updateAccessCount)),
  get('/:testKey/submited', composeMiddle(internalRoute.updatePlayerSubmited)),
  get('/:testKey', composeMiddle(internalRoute.getTestItem)),
  put('/:testKey/rating', composeMiddle(internalRoute.updateInfoRating)),
  get('/*', () => config.serviceName)
)
