const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '/api';

/**
 * 이미지 URL을 절대 경로로 변환 (배포 시 프론트/백엔드 도메인 다를 때 필요)
 * @param {string} url - 상대 경로(/api/uploads/xxx) 또는 절대 URL
 * @returns {string}
 */
export function getImageUrl(url) {
  if (!url) return url;
  if (url.startsWith('http')) return url;
  const base = import.meta.env.VITE_API_BASE_URL ?? '/api';
  const origin = base.replace(/\/api\/?$/, '') || '';
  return origin ? `${origin}${url.startsWith('/') ? url : '/' + url}` : url;
}

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

/**
 * 이미지 업로드 (FormData) - 어드민 전용
 * @param {File} file
 * @returns {Promise<{ url: string }>}
 */
export async function uploadImage(file) {
  const token = typeof window !== 'undefined' && (window.__getAuthToken?.() ?? null);
  const formData = new FormData();
  formData.append('image', file);
  const res = await fetch(`${import.meta.env.VITE_API_BASE_URL ?? '/api'}/upload`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    const message = (() => {
      try {
        return JSON.parse(text).message;
      } catch {
        return text || res.statusText;
      }
    })();
    throw new Error(message);
  }
  const data = await res.json();
  // 상대 URL이면 절대 URL로 변환해 반환 (배포 환경에서 이미지 표시용)
  if (data.url && data.url.startsWith('/')) {
    data.url = getImageUrl(data.url);
  }
  return data;
}

/* 상품 API */
export async function getProducts(params) {
  const qs = params
    ? '?' + new URLSearchParams(
        Object.entries(params).filter(([, v]) => v != null)
      ).toString()
    : '';
  return fetchApi(`/products${qs}`);
}

export async function getProduct(id) {
  return fetchApi(`/products/${id}`);
}

export async function createProduct(data) {
  return fetchApi('/products', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateProduct(id, data) {
  return fetchApi(`/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteProduct(id) {
  const res = await fetch(
    `${import.meta.env.VITE_API_BASE_URL ?? '/api'}/products/${id}`,
    {
      method: 'DELETE',
      headers: window.__getAuthToken?.()
        ? { Authorization: `Bearer ${window.__getAuthToken()}` }
        : {},
    }
  );
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    const message = (() => {
      try {
        return JSON.parse(text).message;
      } catch {
        return text || res.statusText;
      }
    })();
    throw new Error(message);
  }
}

/* 카테고리 API */
export async function getCategories() {
  return fetchApi('/categories');
}

export async function getCategory(id) {
  return fetchApi(`/categories/${id}`);
}

export async function createCategory(data) {
  return fetchApi('/categories', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateCategory(id, data) {
  return fetchApi(`/categories/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

/* 장바구니 API */
export async function getCart() {
  return fetchApi('/cart');
}

export async function addCartItem(productId, quantity = 1) {
  return fetchApi('/cart/items', {
    method: 'POST',
    body: JSON.stringify({ productId, quantity }),
  });
}

export async function updateCartItem(productId, quantity) {
  return fetchApi(`/cart/items/${productId}`, {
    method: 'PUT',
    body: JSON.stringify({ quantity }),
  });
}

export async function removeCartItem(productId) {
  return fetchApi(`/cart/items/${productId}`, { method: 'DELETE' });
}

export async function clearCart() {
  return fetchApi('/cart', { method: 'DELETE' });
}

/* 주문 API */
/**
 * @param {Object} payload
 * @param {string[]} [payload.productIds] - 결제할 상품 ID 목록 (없으면 전체)
 * @param {string} [payload.paymentMethod] - card, bank, kakao, naver, toss, virtual
 * @param {string} [payload.buyerName]
 * @param {string} [payload.buyerEmail]
 * @param {string} [payload.buyerContact]
 * @param {string} [payload.buyerAddress]
 * @param {string} [payload.couponCode]
 * @param {number} [payload.discountAmount]
 * @param {string} [payload.memo]
 */
export async function createOrder(payload = {}) {
  return fetchApi('/orders', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getOrders(params) {
  const qs = params
    ? '?' + new URLSearchParams(
        Object.entries(params).filter(([, v]) => v != null)
      ).toString()
    : '';
  return fetchApi(`/orders${qs}`);
}

export async function getOrdersAdmin(params) {
  const qs = params
    ? '?' + new URLSearchParams(
        Object.entries(params).filter(([, v]) => v != null)
      ).toString()
    : '';
  return fetchApi(`/orders/admin/all${qs}`);
}

export async function getOrder(id) {
  return fetchApi(`/orders/${id}`);
}

export async function updateOrder(id, data) {
  return fetchApi(`/orders/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function cancelOrder(id, hard = false) {
  const qs = hard ? '?hard=true' : '';
  const res = await fetch(
    `${API_BASE}/orders/${id}${qs}`,
    {
      method: 'DELETE',
      headers: getAuthHeaders(),
    }
  );
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    const message = (() => {
      try {
        return JSON.parse(text).message;
      } catch {
        return text || res.statusText;
      }
    })();
    throw new Error(message);
  }
}

export async function deleteCategory(id) {
  const res = await fetch(
    `${import.meta.env.VITE_API_BASE_URL ?? '/api'}/categories/${id}`,
    {
      method: 'DELETE',
      headers: window.__getAuthToken?.()
        ? { Authorization: `Bearer ${window.__getAuthToken()}` }
        : {},
    }
  );
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    const message = (() => {
      try {
        return JSON.parse(text).message;
      } catch {
        return text || res.statusText;
      }
    })();
    throw new Error(message);
  }
}
