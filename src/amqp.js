const createAmqp = require('@bit/tungtung.micro.components.amqp')
module.exports = createAmqp(require('config').AMQP)
