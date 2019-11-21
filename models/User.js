import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  //인증여부
  email_verified: { type: Boolean, required: true, default: false },
  //인증코드
  key_for_verify: { type: String, required: true }
});

const model = mongoose.model("User", UserSchema);

export default model;
