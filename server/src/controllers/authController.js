const jwt = require('jsonwebtoken');
const { User } = require('../models');

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-change-me';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * POST /api/auth/login - 이메일/비밀번호 로그인
 * body: { email, password }
 * returns: { token, user }
 */
async function login(req, res) {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ message: '이메일과 비밀번호를 입력해 주세요.' });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({ message: '이메일 또는 비밀번호가 올바르지 않습니다.' });
    }

    let isMatch = false;
    try {
      isMatch = await user.comparePassword(password);
    } catch (compareErr) {
      console.error('[POST /api/auth/login] bcrypt compare error:', compareErr.message);
      return res.status(500).json({
        message: '비밀번호 검증 중 오류가 발생했습니다. DB에서 비밀번호가 평문으로 저장되었을 수 있습니다. 회원가입으로 새 계정을 만들거나, 해당 계정을 MongoDB에서 삭제 후 다시 회원가입 해주세요.',
      });
    }
    if (!isMatch) {
      return res.status(401).json({ message: '이메일 또는 비밀번호가 올바르지 않습니다.' });
    }

    const token = jwt.sign(
      { userId: user._id.toString() },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    const userObj = user.toJSON();
    res.json({ token, user: userObj });
  } catch (err) {
    console.error('[POST /api/auth/login]', err.message, err);
    res.status(500).json({
      message: process.env.NODE_ENV === 'production'
        ? '로그인 처리 중 오류가 발생했습니다.'
        : `로그인 오류: ${err.message}`,
    });
  }
}

/**
 * GET /api/auth/me - 토큰으로 현재 로그인 유저 정보 조회
 * Header: Authorization: Bearer <token>
 * 인증 미들웨어가 토큰 검증 후 req.user에 유저 담아줌
 */
async function getMe(req, res) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: '유효한 토큰이 필요합니다.' });
    }
    res.json(req.user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

/**
 * POST /api/auth/logout - 클라이언트에서 토큰 삭제하므로 서버는 성공만 반환
 * (토큰 블랙리스트가 필요하면 여기서 구현)
 */
async function logout(req, res) {
  res.json({ message: '로그아웃되었습니다.' });
}

module.exports = { login, getMe, logout };
