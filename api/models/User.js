const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const UserSchema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    username: { type: String, required: true, min: 4, unique: true },
    password: { type: String, required: true },
  },
  {
    versionKey: false, // disables __v
  }
);

const UserModel = model("User", UserSchema);

module.exports = UserModel;
