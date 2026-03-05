const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const SALT_ROUNDS = 10;

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, '이름은 필수입니다.'],
      trim: true,
    },
    contact: {
      type: String,
      required: [true, '연락처는 필수입니다.'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, '이메일은 필수입니다.'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, '패스워드는 필수입니다.'],
      minlength: [6, '패스워드는 6자 이상이어야 합니다.'],
      select: false,
    },
    userType: {
      type: String,
      required: [true, '유저타입은 필수입니다.'],
      enum: {
        values: ['customer', 'admin'],
        message: '유저타입은 customer 또는 admin 이어야 합니다.',
      },
      default: 'customer',
    },
    address: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        delete ret.password;
        return ret;
      },
    },
  }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    this.password = await bcrypt.hash(this.password, SALT_ROUNDS);
    next();
  } catch (err) {
    next(err);
  }
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
