import express from "express";
import User from "../models/User";
import crypto from "crypto";
import {
  getLogin,
  getJoin,
  postJoin,
  getLogout,
  postLogin,
  confirmEmail,
  resendEmail,
  verifyEmail
} from "../controllers/userController";
import passport from "passport";
const LocalStrategy = require("passport-local").Strategy;

const userRouter = express.Router();

userRouter.get("/", getLogin);
userRouter.post(
  "/login",
  passport.authenticate("local", { failureRedirect: "/", failureFlash: true }), // 인증 실패 시 '/login'으로 이동
  postLogin
);
userRouter.get("/join", getJoin);
userRouter.post("/join", postJoin);
userRouter.get("/logout", getLogout);
userRouter.get("/verifyEmail", verifyEmail);
userRouter.post("/resendEmail", resendEmail);
userRouter.get("/confirmEmail", confirmEmail);

//로그인에 성공할 시 serializeUser 메서드를 통해서 사용자 정보를 세션에 저장
passport.serializeUser(function(user, done) {
  done(null, user);
});

//사용자 인증 후 요청이 있을 때마다 호출
passport.deserializeUser(function(user, done) {
  done(null, user);
});

passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
      passReqToCallback: true //request callback 여부
    },
    function(req, email, password, done) {
      User.findOne(
        {
          email: email,
          password: crypto
            .createHash("sha512")
            .update(password)
            .digest("base64"),
          email_verified: true
        },
        function(err, user) {
          if (err) {
            throw err;
          } else if (!user) {
            return done(
              null,
              false,
              req.flash("login_message", "이메일 또는 비밀번호를 확인하세요")
            ); // 로그인 실패
          } else {
            return done(null, user); // 로그인 성공
          }
        }
      );
    }
  )
);

export default userRouter;
