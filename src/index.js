const { router, get, post, withNamespace } = require('microrouter')
const { handleErrors } = require('@bit/tungtung.micro.components.micro-boom')
const createMiddlewareAuth = require('@bit/tungtung.micro.components.middleware-auth-community')
const cors = require('micro-cors')({ origin: '*' })
const config = require('config')
const { connect } = require('@bit/tungtung.micro.components.mongo')
connect(config.mongodbUrl)

const playerRoute = require('routes/user')
const adminRoute = require('routes/admin')
const internalRoute = require('routes/internal')

const adminNamespace = withNamespace(`/${config.serviceName}/admin`)
const userNamespace = withNamespace(`/${config.serviceName}/user`)

const authMiddleware = createMiddlewareAuth()

const composeMiddle = func => handleErrors(authMiddleware(func))

const routerConbine = (...args) => cors(router(...args))

module.exports = routerConbine(
  adminNamespace(post('/', composeMiddle(adminRoute.create))),
  userNamespace(
    get('/:quizListKey/access-log', composeMiddle(playerRoute.createAccessLog)),
    get(
      '/:quizListKey/only-view',
      composeMiddle(playerRoute.getQuizlistOnlyView)
    ),
    get('/:quizListKey/play', composeMiddle(playerRoute.getQuizlistPlay)),
    get('/:quizListKey', composeMiddle(playerRoute.getQuizlistDetail))
  ),
  get('/health', () => 'Working...'),
  get('/access-log/:accessLogId', composeMiddle(internalRoute.getAccessLog)),
  get(
    '/:quizListKey/access-count',
    composeMiddle(internalRoute.updateAccessCount)
  ),
  get(
    '/:quizListKey/submited',
    composeMiddle(internalRoute.updatePlayerSubmited)
  ),
  get('/:quizListKey', composeMiddle(internalRoute.getQuizListItem)),
  get('/*', () => config.serviceName)
)
