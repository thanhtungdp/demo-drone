const { router, get, post, put, withNamespace } = require('microrouter')
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
    get('/created', composeMiddle(adminRoute.getTestListByCreated)),
    get('/draft', composeMiddle(adminRoute.getTestListByDraft)),
    get('/update/:testKey', composeMiddle(adminRoute.getTestForUpdate))
  ),
  userNamespace(
    get('/played', composeMiddle(playerRoute.getTestListByPlayed)),
    get('/playing', composeMiddle(playerRoute.getTestListByPlaying)),
    get('/:testKey/access-log', composeMiddle(playerRoute.createAccessLog)),
    get('/:testKey/only-view', composeMiddle(playerRoute.getTestOnlyView)),
    get('/:testKey/play', composeMiddle(playerRoute.getTestPlay)),
    get('/:testKey', composeMiddle(playerRoute.getTestDetail)),
    get('/', composeMiddle(playerRoute.getTestList))
  ),
  get('/health', () => 'Working...'),
  post('/', composeMiddle(internalRoute.getTestList)),
  get('/access-log/:accessLogId', composeMiddle(internalRoute.getAccessLog)),
  get('/:testKey/access-count', composeMiddle(internalRoute.updateAccessCount)),
  get('/:testKey/submited', composeMiddle(internalRoute.updatePlayerSubmited)),
  get('/:testKey', composeMiddle(internalRoute.getTestItem)),
  put('/:testKey/rating', composeMiddle(internalRoute.updateRating)),
  get('/*', () => config.serviceName)
)
