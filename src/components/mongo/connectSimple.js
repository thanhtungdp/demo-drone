/**
 * Created by Tien Nguyen on 9/6/18.
 */
const mongoose  = require('mongoose');

const connectWithDB = (url) => {
  mongoose.Promise = global.Promise;
  mongoose.connect(url)
}

module.exports = connectWithDB;
