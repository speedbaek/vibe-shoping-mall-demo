const mongoose = require('mongoose');
const { Order, Cart } = require('../models');

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

async function list(req, res) {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const skip = (page - 1) * limit;
    const status = req.query.status;

    const filter = { user: req.user._id };
    if (status) filter.status = status;

    const [orders, totalCount] = await Promise.all([
      Order.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('user', 'name email')
        .populate('items.product', 'name imageUrl')
        .lean(),
      Order.countDocuments(filter),
    ]);

    res.json({
      orders,
      totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit) || 1,
    });
  } catch (err) {
    console.error('[ordersController.list]', err);
    res.status(500).json({ message: err.message || '주문 목록 조회에 실패했습니다.' });
  }
}

async function listAll(req, res) {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const skip = (page - 1) * limit;
    const status = req.query.status;

    const filter = {};
    if (status) filter.status = status;

    const [orders, totalCount] = await Promise.all([
      Order.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('user', 'name email')
        .populate('items.product', 'name imageUrl price')
        .lean(),
      Order.countDocuments(filter),
    ]);

    res.json({
      orders,
      totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit) || 1,
    });
  } catch (err) {
    console.error('[ordersController.listAll]', err);
    res.status(500).json({ message: err.message || '주문 목록 조회에 실패했습니다.' });
  }
}

async function getById(req, res) {
  if (!isValidId(req.params.id)) {
    return res.status(400).json({ message: '유효하지 않은 ID입니다.' });
  }
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email contact')
      .populate('items.product', 'name imageUrl price');
    if (!order) {
      return res.status(404).json({ message: '주문을 찾을 수 없습니다.' });
    }
    if (req.user.userType !== 'admin' && String(order.user._id) !== String(req.user._id)) {
      return res.status(403).json({ message: '권한이 없습니다.' });
    }
    res.json(order);
  } catch (err) {
    console.error('[ordersController.getById]', err);
    res.status(500).json({ message: err.message || '주문 조회에 실패했습니다.' });
  }
}

async function update(req, res) {
  if (!isValidId(req.params.id)) {
    return res.status(400).json({ message: '유효하지 않은 ID입니다.' });
  }
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: '주문을 찾을 수 없습니다.' });
    }
    const { status, paymentStatus, memo } = req.body;
    if (status !== undefined) order.status = status;
    if (paymentStatus !== undefined) order.paymentStatus = paymentStatus;
    if (memo !== undefined) order.memo = memo;
    await order.save();
    await order.populate('user', 'name email');
    res.json(order);
  } catch (err) {
    console.error('[ordersController.update]', err);
    res.status(500).json({ message: err.message || '주문 수정에 실패했습니다.' });
  }
}

async function remove(req, res) {
  if (!isValidId(req.params.id)) {
    return res.status(400).json({ message: '유효하지 않은 ID입니다.' });
  }
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: '주문을 찾을 수 없습니다.' });
    }
    if (req.user.userType !== 'admin' && String(order.user) !== String(req.user._id)) {
      return res.status(403).json({ message: '권한이 없습니다.' });
    }
    if (req.user.userType === 'admin' && req.query.hard === 'true') {
      await Order.findByIdAndDelete(req.params.id);
      return res.status(204).send();
    }
    if (!['pending', 'paid'].includes(order.status)) {
      return res.status(400).json({ message: '취소할 수 없는 주문 상태입니다.' });
    }
    order.status = 'cancelled';
    order.paymentStatus = order.paymentStatus === 'paid' ? 'refunded' : order.paymentStatus;
    await order.save();
    res.status(204).send();
  } catch (err) {
    console.error('[ordersController.remove]', err);
    res.status(500).json({ message: err.message || '주문 취소에 실패했습니다.' });
  }
}

async function create(req, res) {
  try {
    const {
      productIds,
      paymentMethod,
      buyerName,
      buyerEmail,
      buyerContact,
      buyerAddress,
      couponCode,
      discountAmount,
      memo,
      pgOrderId,
      pgTransactionId,
      pgProvider,
    } = req.body || {};

    const cart = await Cart.findOne({ user: req.user._id }).populate(
      'items.product'
    );
    if (!cart || !cart.items?.length) {
      return res.status(400).json({ message: '장바구니가 비어 있습니다.' });
    }

    let targetItems = cart.items;
    if (Array.isArray(productIds) && productIds.length > 0) {
      const idSet = new Set(productIds.map(String));
      targetItems = cart.items.filter(
        (i) => i.product && idSet.has(String(i.product._id))
      );
    }
    if (!targetItems.length) {
      return res.status(400).json({ message: '결제할 상품을 선택해 주세요.' });
    }

    const items = targetItems.map((i) => ({
      product: i.product._id,
      name: i.product.name,
      price: i.product.price,
      quantity: i.quantity,
    }));

    const totalAmount = items.reduce(
      (sum, i) => sum + i.price * i.quantity,
      0
    );
    const discount = Number(discountAmount) || 0;
    const finalAmount = Math.max(0, totalAmount - discount);

    const orderData = {
      user: req.user._id,
      items,
      totalAmount,
      discountAmount: discount,
      buyerName: buyerName || req.user.name,
      buyerEmail: buyerEmail || req.user.email,
      buyerContact: buyerContact || req.user.contact,
      buyerAddress: buyerAddress || req.user.address || undefined,
      paymentMethod: paymentMethod || 'card',
      paymentStatus: 'paid',
      paidAt: new Date(),
      status: 'paid',
      memo: memo || undefined,
      couponCode: couponCode || undefined,
    };
    if (pgOrderId) orderData.pgOrderId = pgOrderId;
    if (pgTransactionId) orderData.pgTransactionId = pgTransactionId;
    if (pgProvider) orderData.pgProvider = pgProvider;

    const order = await Order.create(orderData);

    const orderedProductIds = new Set(items.map((i) => String(i.product)));
    cart.items = cart.items.filter(
      (i) => !i.product || !orderedProductIds.has(String(i.product._id))
    );
    await cart.save();

    await order.populate('user', 'name email');
    res.status(201).json(order);
  } catch (err) {
    console.error('[ordersController.create]', err);
    res.status(500).json({ message: err.message || '주문 처리에 실패했습니다.' });
  }
}

module.exports = {
  create,
  list,
  listAll,
  getById,
  update,
  remove,
};
