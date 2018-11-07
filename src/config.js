module.exports = {
  serviceName: 'test',
  mongodbUrl: process.env.MONGODB_URL,
  publicApp: `${process.env.SUPPORTED_PROTOCOL}://${process.env.DOMAIN_NAME}`,
  publicAppProtocol: process.env.PUBLIC_APP_PROTOCOL,
  AMQP: process.env.AMQP,
}
