# MongoDB utils database

* **connect** connect database support: autoconnect, manager multiple connections
* **createModel** custom method DAO, and support pagination

## Connect database

```javascript
const { connect } = require('tungtung.micro/components/mongo')
connect('mongodb://example.com/')
```

## Create model

Create model
```javascript
const { createModel } = require('tungtung.micro/components/mongo')

const UserSchema = new Schema({
  email: String,
  username: String,
  password: String,
  fullname: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
})

module.exports = createModel({
  name: 'users',
  schema: UserSchema,
}, {
  login: async function(user){
    return true
  }
})
```

Usage

```javascript
const User = require('models/User')
const isUserLogin = await User.login({username: 'thanhtungdp'})
```
