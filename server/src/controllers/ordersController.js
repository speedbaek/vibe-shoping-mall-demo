const { Order, Cart } = require('../models');

async function create(req, res) {
  try {
    const { productIds } = req.body || {};
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

    const order = await Order.create({
      user: req.user._id,
      items,
      totalAmount,
      status: 'pending',
    });

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

module.exports = { create };
