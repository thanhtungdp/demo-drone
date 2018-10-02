const { router, get, withNamespace } = require('microrouter')
const { handleErrors } = require('@bit/tungtung.micro.components.micro-boom')
const playerRouter = require('./routes/player')
const cors = require('micro-cors')({ origin: '*' })
const config = require('config')
// const faker = require('faker')

const namespace = withNamespace(`/${config.serviceName}`)

const routerConbine = (...args) => cors(router(...args))

module.exports = routerConbine(
  namespace(
    get('/:quizListKey', handleErrors(playerRouter.getQuizlistDetail)),
    get('/test', handleErrors(() => 'Welcome clean service')),
    get('/*', () => config.serviceName)
  ),
  get('/health', () => 'Working...'),
  get('/*', () => config.serviceName)
)
