const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const saltRounds = 10
const jwt = require('jsonwebtoken')

const userSchema = mongoose.Schema({
  name:{
    type:String,
    maxLength:50
  },
  email:{
    type:String,
    trim : true,
    unique:1
  },
  id:{
    type:String,
    unique:1, 
    maxLength:20
  },
  password:{
    type:String,
    unique:1, 
  },
  lastName:{
    type:String,
    maxLength:50
  },
  role:{
    type:Number,
    default:0
  },
  image:String,
  token:{
    type:String,
    maxLength:300
  },
  tokenExp:{
    type:Number
  }
})

userSchema.methods.comparePassword = function(plainPassword,cb){
  bcrypt.compare(plainPassword,this.password,function(err,isMatch){
    if(err) return cb(err),
    cb(null,isMatch)
  })
}
userSchema.methods.generateToken = function(cb){
  //jsonwebtoken을 이용해 생성하기
  const user = this
  const token = jwt.sign(user._id.toHexString(),'secret_token')
  user.token = token
  user.save(function(err,user){
    if(err) return cb(err)
    cb(null,user)
  })
}
userSchema.pre('save',function(next){
  // 비밀번호 암호화
  let user = this
  if(user.isModified('password')){
    bcrypt.genSalt(saltRounds, function(err, salt) {
      if(err) return next(err) 
      bcrypt.hash(user.password, salt, function(err, hash) {
        if(err) return next(err)
        user.password = hash
        next()
      })
    })
  }
  else{
    next()
  }
})
userSchema.statics.findByToken = function(token,cb){
  const user = this
  // 디코드 한다.
  jwt.verify(token,'secret_token',function(err,decoded){
    // 유저 아이디를 이용해서 유저를 찾은 다음에 
    // 클라이언트에서 가져온 toekn과 db에 저장된 토큰이 일치하는지 확인
    user.findOne({"_id":decoded,"token":token},function(err,user){
      if (err) return cb(err)
      cb(null,user)
    })
  })
}
const User = mongoose.model('User',userSchema)
module.exports = {User}