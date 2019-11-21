import User from "../models/User";
import crypto from "crypto";
import nodemailer from "nodemailer";
import smtpTransporter from "nodemailer-smtp-transport";

export const getLogin = (req, res) =>
  res.render("login", {
    pageTitle: "login",
    message: req.flash("login_message")
  });

export const postLogin = (req, res) => {
  res.render("loggedIn", { pageTitle: "loggeIn", email: req.body.email });
  console.log(req.body.email);
};

export const getJoin = (req, res) => res.render("join", { pageTitle: "join" });
export const postJoin = (req, res, next) => {
  const {
    body: { email, password, password2 }
  } = req;
  User.find({ email })
    .exec()
    .then(user => {
      if (user.length >= 1) {
        res.send(
          '<script type="text/javascript">alert("이미 존재하는 이메일입니다."); window.location="/join"; </script>'
        );
      } else if (password !== password2) {
        res.send(
          '<script type="text/javascript">alert("비밀번호가 서로 같지 않습니다."); window.location="/join"; </script>'
        );
      } else {
        var key_one = crypto
          .randomBytes(256)
          .toString("hex")
          .substr(100, 5);
        var key_two = crypto
          .randomBytes(256)
          .toString("base64")
          .substr(50, 5);
        var key_for_verify = key_one + key_two;
        const user = new User({
          email,
          password: crypto
            .createHash("sha512")
            .update(password)
            .digest("base64"),
          key_for_verify: key_for_verify
        });
        var smtpTransport = nodemailer.createTransport(
          smtpTransporter({
            service: "Gmail",
            host: "smtp.gmail.com",
            auth: {
              user: "baekyungisa@gmail.com",
              pass: process.env.PASSWORD
            }
          })
        );
        user
          .save()
          .then(result => {
            console.log(result);
            //url
            var url =
              "http://" +
              req.get("host") +
              "/confirmEmail" +
              "?key=" +
              key_for_verify;
            //옵션
            var mailOpt = {
              from: "baekyungisa@gmail.com",
              to: user.email,
              subject: "이메일 인증을 진행해주세요.",
              html: `<h1>이메일 인증을 위해 URL을 클릭해주세요.</h1><br><a href="${url}">누르면 이메일 인증 완료</a>`
            };
            //전송
            smtpTransport.sendMail(mailOpt, function(err, res) {
              if (err) {
                console.log(err);
              } else {
                console.log("email has been sent.");
              }
              smtpTransport.close();
            });
            res.render("verifyEmail", {
              pageTitle: "verifyEmail",
              email: req.body.email
            });
            console.log(req.body.email);
          })
          .catch(err => {
            console.log(err);
          });
      }
    });
};

export const verifyEmail = (req, res) => {
  res.render("verifyEmail", {
    pageTitle: "verifyEmail",
    email: req.body.email
  });
};

export const confirmEmail = (req, res) => {
  User.updateOne(
    { key_for_verify: req.query.key },
    { $set: { email_verified: true } },
    function(err, user) {
      //에러처리
      if (err) {
        console.log(err);
      }
      //일치하는 key가 없으면
      else if (user.n == 0) {
        res.send(
          '<script type="text/javascript">alert("인증 실패"); window.location="/"; </script>'
        );
      }
      //인증 성공
      else {
        res.send(
          '<script type="text/javascript">alert("인증 성공"); window.location="/"; </script>'
        );
      }
    }
  );
};

export const resendEmail = (req, res) => {
  console.log(req.body.email);
  res.send(
    '<script type="text/javascript">alert("이메일을 재전송 하였습니다."); window.location="/verifyEmail"; </script>'
  );
};

export const getLogout = (req, res) => {
  req.logout();
  res.redirect("/");
};
