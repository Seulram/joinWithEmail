import express from "express";
import userRouter from "./routers/userRouter";
import bodyParser from "body-parser";
import passport from "passport";
import Session from "express-session";
import flash from "connect-flash";
const LocalStrategy = require("passport-local").Strategy;

var MongoDBStore = require("connect-mongodb-session")(Session);

const app = express();

// 뷰엔진 설정
app.set("view engine", "pug");
//app.set("views", __dirname + "/views");
//app.use(express.static(__dirname + "/public"));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(flash());

//세션
var store = new MongoDBStore({
  //세션을 저장할 공간
  uri: process.env.MONGO_URL, //db url
  collection: "sessions" //콜렉션 이름
});

store.on("error", function(error) {
  //에러처리
  console.log(error);
});

app.use(
  Session({
    secret: process.env.SECRET, //세션 암호화 key
    resave: false, //세션 재저장 여부
    saveUninitialized: true,
    rolling: true, //로그인 상태에서 페이지 이동 시마다 세션값 변경 여부
    cookie: { maxAge: 1000 * 60 * 60 }, //유효시간
    store: store
  })
);

app.use(passport.initialize());
app.use(passport.session());

// use routes
app.use("/", userRouter);

export default app;
