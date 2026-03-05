const mongoose = require('mongoose');
const { User } = require('../models');

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

function handleError(err, res) {
  if (!err) {
    return res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
  if (err.code === 11000) {
    return res.status(409).json({ message: '이미 사용 중인 이메일입니다.' });
  }
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors || {})
      .map((e) => e.message)
      .join(', ');
    return res.status(400).json({ message: message || '입력값을 확인해 주세요.' });
  }
  const message = err.message || '서버 오류가 발생했습니다.';
  console.error('[usersController]', message, err);
  res.status(500).json({ message });
}

/**
 * POST /api/users - 회원가입 (클라이언트 회원가입 폼에서 호출)
 * body: { name, email, contact, password, userType?, address? }
 */
async function create(req, res) {
  try {
    const { name, email, contact, password, userType, address } = req.body || {};
    const user = await User.create({
      name,
      email,
      contact,
      password,
      userType: userType || 'customer',
      address: address || undefined,
    });
    res.status(201).json(user);
  } catch (err) {
    console.error('[POST /api/users]', err);
    handleError(err, res);
  }
}

async function list(req, res) {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function getById(req, res) {
  if (!isValidId(req.params.id)) {
    return res.status(400).json({ message: '유효하지 않은 ID입니다.' });
  }
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: '유저를 찾을 수 없습니다.' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function update(req, res) {
  if (!isValidId(req.params.id)) {
    return res.status(400).json({ message: '유효하지 않은 ID입니다.' });
  }
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: '유저를 찾을 수 없습니다.' });
    }
    const { name, contact, email, password, userType, address } = req.body;
    if (name !== undefined) user.name = name;
    if (contact !== undefined) user.contact = contact;
    if (email !== undefined) user.email = email;
    if (password !== undefined) user.password = password;
    if (userType !== undefined) user.userType = userType;
    if (address !== undefined) user.address = address;
    await user.save();
    res.json(user);
  } catch (err) {
    handleError(err, res);
  }
}

async function remove(req, res) {
  if (!isValidId(req.params.id)) {
    return res.status(400).json({ message: '유효하지 않은 ID입니다.' });
  }
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: '유저를 찾을 수 없습니다.' });
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
