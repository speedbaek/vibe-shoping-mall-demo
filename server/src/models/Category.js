const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: [true, '카테고리 ID는 필수입니다.'],
      trim: true,
      unique: true,
    },
    label: {
      type: String,
      required: [true, '카테고리명은 필수입니다.'],
      trim: true,
    },
    icon: {
      type: String,
      trim: true,
      default: '📦',
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Category', categorySchema);
