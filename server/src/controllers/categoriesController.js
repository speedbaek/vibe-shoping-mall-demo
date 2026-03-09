const mongoose = require('mongoose');
const { Category } = require('../models');

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

function handleError(err, res) {
  if (!err) {
    return res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
  if (err.code === 11000) {
    return res.status(409).json({ message: '이미 존재하는 카테고리 ID입니다.' });
  }
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors || {})
      .map((e) => e.message)
      .join(', ');
    return res.status(400).json({ message: message || '입력값을 확인해 주세요.' });
  }
  const message = err.message || '서버 오류가 발생했습니다.';
  console.error('[categoriesController]', message, err);
  res.status(500).json({ message });
}

async function create(req, res) {
  try {
    const { id, label, icon, order } = req.body || {};
    const category = await Category.create({
      id: id?.trim() || undefined,
      label: label?.trim() || undefined,
      icon: icon?.trim() || '📦',
      order: order ?? 0,
    });
    res.status(201).json(category);
  } catch (err) {
    handleError(err, res);
  }
}

async function list(req, res) {
  try {
    const categories = await Category.find().sort({ order: 1, createdAt: 1 });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function getById(req, res) {
  if (!isValidId(req.params.id)) {
    return res.status(400).json({ message: '유효하지 않은 ID입니다.' });
  }
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: '카테고리를 찾을 수 없습니다.' });
    }
    res.json(category);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function update(req, res) {
  if (!isValidId(req.params.id)) {
    return res.status(400).json({ message: '유효하지 않은 ID입니다.' });
  }
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: '카테고리를 찾을 수 없습니다.' });
    }
    const { id: newId, label, icon, order } = req.body;
    if (newId !== undefined) category.id = newId?.trim() || category.id;
    if (label !== undefined) category.label = label?.trim();
    if (icon !== undefined) category.icon = icon?.trim() || '📦';
    if (order !== undefined) category.order = order;
    await category.save();
    res.json(category);
  } catch (err) {
    handleError(err, res);
  }
}

async function remove(req, res) {
  if (!isValidId(req.params.id)) {
    return res.status(400).json({ message: '유효하지 않은 ID입니다.' });
  }
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      return res.status(404).json({ message: '카테고리를 찾을 수 없습니다.' });
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
