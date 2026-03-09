const mongoose = require('mongoose');
const { Cart, Product } = require('../models');

async function getOrCreateCart(userId) {
  let cart = await Cart.findOne({ user: userId }).populate('items.product');
  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
  }
  return cart;
}

async function getCart(req, res) {
  try {
    const cart = await getOrCreateCart(req.user._id);
    await cart.populate('items.product');
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function addItem(req, res) {
  try {
    const { productId, quantity = 1 } = req.body || {};
    if (!productId) {
      return res.status(400).json({ message: '상품 ID가 필요합니다.' });
    }
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: '유효하지 않은 상품 ID입니다.' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: '상품을 찾을 수 없습니다.' });
    }

    const qty = Math.max(1, Math.floor(Number(quantity)));
    if (product.stock != null && product.stock > 0 && qty > product.stock) {
      return res.status(400).json({
        message: `재고가 부족합니다. (최대 ${product.stock}개)`,
      });
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    const existIdx = cart.items.findIndex(
      (i) => i.product.toString() === productId
    );
    if (existIdx >= 0) {
      const newQty = cart.items[existIdx].quantity + qty;
      if (product.stock != null && product.stock > 0 && newQty > product.stock) {
        return res.status(400).json({
          message: `재고가 부족합니다. (최대 ${product.stock}개)`,
        });
      }
      cart.items[existIdx].quantity = newQty;
    } else {
      cart.items.push({ product: productId, quantity: qty });
    }
    await cart.save();
    await cart.populate('items.product');
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function updateItem(req, res) {
  try {
    const { productId } = req.params;
    const { quantity } = req.body || {};
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: '유효하지 않은 상품 ID입니다.' });
    }

    const qty = Math.max(0, Math.floor(Number(quantity)));
    if (qty === 0) {
      return removeItem(req, res);
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: '장바구니가 비어 있습니다.' });
    }

    const item = cart.items.find((i) => i.product.toString() === productId);
    if (!item) {
      return res.status(404).json({ message: '장바구니에 해당 상품이 없습니다.' });
    }

    const product = await Product.findById(productId);
    if (product?.stock != null && product.stock > 0 && qty > product.stock) {
      return res.status(400).json({
        message: `재고가 부족합니다. (최대 ${product.stock}개)`,
      });
    }

    item.quantity = qty;
    await cart.save();
    await cart.populate('items.product');
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function removeItem(req, res) {
  try {
    const { productId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: '유효하지 않은 상품 ID입니다.' });
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: '장바구니가 비어 있습니다.' });
    }

    cart.items = cart.items.filter((i) => i.product.toString() !== productId);
    await cart.save();
    await cart.populate('items.product');
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function clearCart(req, res) {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (cart) {
      cart.items = [];
      await cart.save();
    }
    res.json(cart || { user: req.user._id, items: [] });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

module.exports = {
  getCart,
  addItem,
  updateItem,
  removeItem,
  clearCart,
};
