const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  title: String,
  content: String,
  likes: {
    type: Number,
    default: 0,
  },
  dislikes: {
    type: Number,
    default: 0,
  },
  comments: [
    {
      text: String,
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    },
  ],
});

const userSchema = new mongoose.Schema({
  name: String,
  // Otros campos de usuario
});

const PostLike = mongoose.model('PostLike', postSchema);
const UserLike = mongoose.model('UserLike', userSchema);
