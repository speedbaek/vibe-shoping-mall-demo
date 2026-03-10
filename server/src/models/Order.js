const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  productType: { type: String, default: 'course' }, // course, consulting, bundle
});

function generateOrderNo() {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `ORD-${dateStr}-${random}`;
}

const orderSchema = new mongoose.Schema(
  {
    orderNo: {
      type: String,
      unique: true,
      sparse: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    items: [orderItemSchema],
    totalAmount: { type: Number, required: true },
    discountAmount: { type: Number, default: 0 },
    finalAmount: { type: Number },
    status: {
      type: String,
      enum: ['pending', 'paid', 'preparing', 'completed', 'cancelled', 'refunded'],
      default: 'pending',
    },
    paymentMethod: {
      type: String,
      enum: ['card', 'bank', 'kakao', 'naver', 'toss', 'virtual'],
      default: 'card',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
    paidAt: { type: Date },
    pgProvider: { type: String },
    pgOrderId: { type: String },
    pgTransactionId: { type: String },
    buyerName: { type: String },
    buyerEmail: { type: String },
    buyerContact: { type: String },
    buyerAddress: { type: String },
    couponCode: { type: String },
    memo: { type: String },
  },
  { timestamps: true }
);

orderSchema.pre('save', function (next) {
  if (!this.orderNo) this.orderNo = generateOrderNo();
  if (this.finalAmount == null)
    this.finalAmount = Math.max(0, (this.totalAmount || 0) - (this.discountAmount || 0));
  next();
});

module.exports = mongoose.model('Order', orderSchema);
