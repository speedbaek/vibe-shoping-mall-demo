const jwt = require('jsonwebtoken');
const { User } = require('../models');

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-change-me';

/**
 * JWT 검증 후 req.user에 유저 정보 담기
 * Authorization: Bearer <token> 으로 토큰 전달 → 토큰으로 유저 조회 후 req.user에 설정
 */
async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
      return res.status(401).json({ message: '로그인이 필요합니다.' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return res.status(401).json({ message: '유효하지 않은 토큰입니다.' });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: '로그인이 만료되었습니다. 다시 로그인해 주세요.' });
    }
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: '유효하지 않은 토큰입니다.' });
    }
    next(err);
  }
}

/**
 * authenticate 후 어드민 권한 확인
 */
function requireAdmin(req, res, next) {
  if (req.user?.userType !== 'admin') {
    return res.status(403).json({ message: '관리자 권한이 필요합니다.' });
  }
  next();
}

/**
 * 토큰이 있으면 req.user 설정, 없으면 통과 (선택 인증)
 */
async function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ')
      ? authHeader.slice(7)
      : null;

    if (!token) return next();

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    if (user) req.user = user;
    next();
  } catch {
    next();
  }
}

module.exports = { authenticate, requireAdmin, optionalAuth };
