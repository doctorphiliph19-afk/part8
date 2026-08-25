const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")

const schema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    minlength: 3,
  },
  favoriteGenre: {
    type: String,
    required: true,
  },
  passwordHash: {
    type: String,
    required: true,
    default: () => bcrypt.hashSync("secret", 10),
  },
})

module.exports = mongoose.model("User", schema)