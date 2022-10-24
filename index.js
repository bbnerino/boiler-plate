const express = require("express"); // express 모듈 가져오기
const app = express(); // 새로운 express 앱생성
const port = 3000; // 포트번호지정
const { User } = require("./models/User");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
//application/x-www.form.urlencoded
app.use(bodyParser.urlencoded({ extended: true }));
// application/json
app.use(bodyParser.json());
app.use(cookieParser());
const config = require("./config/key");
const { auth } = require("./middleware/auth");
mongoose.connect(config.mongoURI)
  .then(() => {
    console.log("mongoDB connected!");
  })
  .catch((err) => {
    console.log(err);
  });

app.get("/", (req, res) => {
  res.send("Hello World! 노드 실행d");
});

app.post("/api/user/register", (req, res) => {
  // 회원가입 할때 필요한 정보들을 client에서 가져오면
  // 그것들을 데이터 베이스에 넣어줌

  const user = new User(req.body);
  user.save(function (err, userInfo) {
    if (err) return res.json({ success: false, err });
    return res.status(200).json({
      success: true,
    });
  });
});

app.post("/api/user/login", (req, res) => {
  User.findOne({ id: req.body.id }, (err, user) => {
    if (err) {
      return res.json({
        loginSuccess: false,
        message: err,
      });
    }
    // 요청된 이메일을 데이터베이스에서 있는지 찾는다.
    if (!user) {
      return res.json({
        loginSuccess: false,
        message: "이메일이 존재하지 않습니다.",
      });
    }
    // 요청한 이메일이 존재한다면 비밀번호가 같은지 확인
    user.comparePassword(req.body.password, (err, isMatch) => {
      if (err) {
        return res.json({
          logginSuccess: false,
          message: err,
        });
      }
      if (!isMatch) {
        return res.json({
          loginSuccess: false,
          message: "비밀번호가 틀렸습니다.",
        });
      }
    });
    // 비밀번호까지 맞는다면 token을 생성한다.
    user.generateToken((err, user) => {
      if (err) return res.status(400).send(err);
      // 저장은 어디에? 쿠기, 로컬스토리지
      res
        .cookie("x_auth", user.token)
        .status(200)
        .json({ logginSuccess: true, userId: user._id });
    });
  });
});

app.get('/api/user/auth',auth,(req,res)=>{
  // 여기가지 미들웨어 통과해 왔다는 이야기는 auth 성공이라는 말
  res.status(200).json({user:req.user})
})
app.get('/api/user/logout',auth,(req,res)=>{
  User.findOneAndUpdate({_id:req.user._id},{token:""},
  (err,user)=>{
    if(err) return res.json({success:false,err})
    return res.status(200).send({
      success:true
    })
  })
  res.status(200).json({'message':"로그아웃성공"})
})


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});