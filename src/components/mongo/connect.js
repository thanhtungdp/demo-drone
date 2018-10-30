const mongoose = require('mongoose')
const chalk = require('chalk')

const TIMEOUT_RECONNECT = 3000

module.exports = function connectDatabaseUrl (url, options = {}) {
  return new Promise((resolve, reject) => {
    mongoose.Promise = global.Promise
    mongoose
      .createConnection(
        url,
        {
          connectTimeoutMS: TIMEOUT_RECONNECT,
          autoReconnect: true,
          ...options
        },
        (err, result) => {
          if (err) reject(err)
          console.log(chalk.green('connected to database'))
          resolve(result)
        }
      )
      .catch(err => {
        reject(err)
      })
  })
}

// const autoReconnect = db => {
//   const dbUrl = db.client.s.url
//   db.on('connecting', () => console.log('connecting to MongoDB...'))
//   db.on('error', error => {
//     console.log(chalk.red('Error mongodb connect'), error)
//     mongoose.disconnect()
//   })
//   db.on('connected', () => console.log(chalk.green('Mongodb connected'), dbUrl))
//   db.once('open', () => console.log(chalk.green('Mongodb opened')))
//   db.on('reconnected', () => console.log(chalk.green('MongoDB reconnected!')))
//   db.on('disconnected', () => {
//     setTimeout(() => {
//       connectDatabaseUrl(dbUrl)
//         .then(() => {
//           console.log(
//             chalk.green('mongodb reconnect successed'),
//             chalk.blueBright(dbUrl)
//           )
//         })
//         .catch(err =>
//           console.log('lost Internet connection - no connect to mongodb ' + err)
//         )
//     }, TIMEOUT_RECONNECT)
//   })
//   process.on('SIGINT', () => {
//     db.close(() => {
//       console.log(
//         'Mongoose default connection disconnected through app termination'
//       )
//       process.exit(0)
//     })
//   })
// }

// function getConnectCurrent (url) {
//   return mongoose.connections.find(
//     conn => (conn.client ? conn.client.s.url === url : false)
//   )
// }

// module.exports = function manageConnectDatabase (url) {
//   const connectionCurrent = getConnectCurrent(url)
//   return new Promise((resolve, reject) => {
//     if (!connectionCurrent) {
//       connectDatabaseUrl(url)
//         .then(db => {
//           autoReconnect(db)
//           resolve(db)
//           console.log(
//             chalk.green('mongodb connect successed'),
//             chalk.blueBright(url)
//           )
//         })
//         .catch(err => {
//           reject(err)
//           console.log(
//             chalk.red('mongodb lost internet'),
//             chalk.redBright(err.message.toString())
//           )
//         })
//     } else {
//       resolve(connectionCurrent)
//     }
//   })
// }
