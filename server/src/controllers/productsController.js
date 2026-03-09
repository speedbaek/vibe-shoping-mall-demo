const mongoose = require('mongoose');
const { Product } = require('../models');

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

function handleError(err, res) {
  if (!err) {
    return res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors || {})
      .map((e) => e.message)
      .join(', ');
    return res.status(400).json({ message: message || '입력값을 확인해 주세요.' });
  }
  const message = err.message || '서버 오류가 발생했습니다.';
  console.error('[productsController]', message, err);
  res.status(500).json({ message });
}

async function create(req, res) {
  try {
    const { sku, name, price, description, category, stock, imageUrl } = req.body || {};
    const product = await Product.create({
      sku: sku?.trim() || undefined,
      name,
      price,
      description: description || undefined,
      category: category || undefined,
      stock: stock ?? 0,
      imageUrl: imageUrl || undefined,
    });
    console.log('[상품 등록]', product._id, product.name);
    res.status(201).json(product);
  } catch (err) {
    handleError(err, res);
  }
}

async function list(req, res) {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const skip = (page - 1) * limit;

    const [products, totalCount] = await Promise.all([
      Product.find().sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Product.countDocuments(),
    ]);

    res.json({
      products,
      totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit) || 1,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function getById(req, res) {
  if (!isValidId(req.params.id)) {
    return res.status(400).json({ message: '유효하지 않은 ID입니다.' });
  }
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: '상품을 찾을 수 없습니다.' });
    }
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function update(req, res) {
  if (!isValidId(req.params.id)) {
    return res.status(400).json({ message: '유효하지 않은 ID입니다.' });
  }
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: '상품을 찾을 수 없습니다.' });
    }
    const { sku, name, price, description, category, stock, imageUrl } = req.body;
    if (sku !== undefined) product.sku = sku?.trim() || undefined;
    if (name !== undefined) product.name = name;
    if (price !== undefined) product.price = price;
    if (description !== undefined) product.description = description;
    if (category !== undefined) product.category = category;
    if (stock !== undefined) product.stock = stock;
    if (imageUrl !== undefined) product.imageUrl = imageUrl;
    await product.save();
    res.json(product);
  } catch (err) {
    handleError(err, res);
  }
}

async function remove(req, res) {
  if (!isValidId(req.params.id)) {
    return res.status(400).json({ message: '유효하지 않은 ID입니다.' });
  }
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: '상품을 찾을 수 없습니다.' });
    }
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

module.exports = {
  create,
  list,
  getById,
  update,
  remove,
};
