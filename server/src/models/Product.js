const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    sku: {
      type: String,
      trim: true,
      sparse: true,
      unique: true,
    },
    name: {
      type: String,
      required: [true, '상품명은 필수입니다.'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, '가격은 필수입니다.'],
      min: [0, '가격은 0 이상이어야 합니다.'],
    },
    description: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      trim: true,
    },
    stock: {
      type: Number,
      default: 0,
      min: [0, '재고는 0 이상이어야 합니다.'],
    },
    imageUrl: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);
