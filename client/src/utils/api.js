const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '/api';

function getAuthHeaders() {
  const token = typeof window !== 'undefined' && (window.__getAuthToken?.() ?? null);
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

export async function fetchApi(path, options = {}) {
  const url = path.startsWith('http') ? path : `${API_BASE}${path}`;
  const headers = { ...getAuthHeaders(), ...options.headers };
  const res = await fetch(url, { headers, ...options });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    const message = (() => { try { return JSON.parse(text).message; } catch { return text || res.statusText; } })();
    throw new Error(message);
  }
  return res.json();
}

export function setAuthTokenGetter(getter) {
  window.__getAuthToken = getter;
}

/**
 * 회원가입 - 서버에 유저 데이터 저장
 * @param {{ name: string, email: string, contact: string, password: string, address?: string }} data
 * @returns {Promise<Object>} 생성된 유저 (password 제외)
 */
export async function createUser(data) {
  return fetchApi('/users', {
    method: 'POST',
    body: JSON.stringify({
      name: data.name,
      email: data.email,
      contact: data.contact,
      password: data.password,
      userType: 'customer',
      address: data.address || undefined,
    }),
  });
}

/**
 * 로그인 - 토큰 + 유저 정보 반환
 */
export async function login({ email, password }) {
  return fetchApi('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
  });
}

/**
 * 토큰으로 유저 정보 가져오기
 * Authorization 헤더에 저장된 토큰을 붙여 GET /api/auth/me 호출
 * @returns {Promise<Object>} 유저 정보 (password 제외)
 * @throws 토큰 없음/만료/유효하지 않으면 401 에러
 */
export async function getMe() {
  return fetchApi('/auth/me');
}
