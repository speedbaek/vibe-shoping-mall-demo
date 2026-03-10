import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { getProduct, createProduct, updateProduct, uploadImage, getCategories, getImageUrl } from '../../utils/api';
import './AdminProductFormPage.css';

function AdminProductFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [loading, setLoading] = useState(isEdit);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    sku: '',
    name: '',
    price: '',
    description: '',
    category: '',
    stock: 0,
    imageUrl: '',
  });

  useEffect(() => {
    getCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    if (isEdit) {
      loadProduct();
    }
  }, [id, isEdit]);

  async function loadProduct() {
    setLoading(true);
    setError('');
    try {
      const data = await getProduct(id);
      setForm({
        sku: data.sku || '',
        name: data.name || '',
        price: data.price ?? '',
        description: data.description || '',
        category: data.category || '',
        stock: data.stock ?? 0,
        imageUrl: data.imageUrl || '',
      });
    } catch (err) {
      setError(err.message || '상품 정보를 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e) {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? '' : Number(value)) : value,
    }));
    setError('');
  }

  async function handleImageUpload(e) {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    setUploading(true);
    setError('');
    try {
      const { url } = await uploadImage(file);
      setForm((prev) => ({ ...prev, imageUrl: url }));
    } catch (err) {
      setError(err.message || '이미지 업로드에 실패했습니다.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!form.name.trim()) {
      setError('상품명을 입력해 주세요.');
      return;
    }
    const price = Number(form.price);
    if (isNaN(price) || price < 0) {
      setError('가격을 확인해 주세요.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        sku: form.sku.trim() || undefined,
        name: form.name.trim(),
        price,
        description: form.description.trim() || undefined,
        category: form.category.trim() || undefined,
        stock: Number(form.stock) || 0,
        imageUrl: form.imageUrl.trim() || undefined,
      };
      if (isEdit) {
        await updateProduct(id, payload);
        navigate('/admin/products');
      } else {
        await createProduct(payload);
        navigate('/admin/products');
      }
    } catch (err) {
      setError(err.message || '저장에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <p className="admin-loading">로딩 중...</p>;
  }

  return (
    <div className="admin-form-page">
      <div className="admin-form-header">
        <h1 className="admin-form-title">
          {isEdit ? '상품 수정' : '상품 등록'}
        </h1>
        <Link to="/admin/products" className="admin-btn admin-btn-outline">
          목록으로
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="admin-form">
        {error && <p className="admin-error">{error}</p>}

        <div className="admin-form-group">
          <label htmlFor="sku">SKU</label>
          <input
            id="sku"
            name="sku"
            type="text"
            value={form.sku}
            onChange={handleChange}
            placeholder="예: SKU-001 (선택)"
          />
        </div>

        <div className="admin-form-group">
          <label htmlFor="name">상품명 *</label>
          <input
            id="name"
            name="name"
            type="text"
            value={form.name}
            onChange={handleChange}
            placeholder="상품명을 입력하세요"
            required
          />
        </div>

        <div className="admin-form-group">
          <label htmlFor="price">가격 (원) *</label>
          <input
            id="price"
            name="price"
            type="number"
            min="0"
            value={form.price}
            onChange={handleChange}
            placeholder="0"
            required
          />
        </div>

        <div className="admin-form-group">
          <label htmlFor="description">설명</label>
          <textarea
            id="description"
            name="description"
            rows={3}
            value={form.description}
            onChange={handleChange}
            placeholder="상품 설명 (선택)"
          />
        </div>

        <div className="admin-form-row">
          <div className="admin-form-group">
            <label htmlFor="category">카테고리</label>
            <select
              id="category"
              name="category"
              value={form.category}
              onChange={handleChange}
            >
              <option value="">선택 안 함</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat.label}>
                  {cat.icon ? `${cat.icon} ` : ''}{cat.label}
                </option>
              ))}
            </select>
          </div>
          <div className="admin-form-group">
            <label htmlFor="stock">재고</label>
            <input
              id="stock"
              name="stock"
              type="number"
              min="0"
              value={form.stock}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="admin-form-group">
          <label>상품 이미지</label>
          <div className="admin-image-upload">
            {form.imageUrl ? (
              <div className="admin-image-preview-wrap">
                <img src={getImageUrl(form.imageUrl)} alt="미리보기" className="admin-image-preview" />
                <div className="admin-image-actions">
                  <label className="admin-btn admin-btn-sm admin-btn-outline">
                    변경
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploading}
                      hidden
                    />
                  </label>
                  <button
                    type="button"
                    className="admin-btn admin-btn-sm admin-btn-outline"
                    onClick={() => setForm((p) => ({ ...p, imageUrl: '' }))}
                  >
                    제거
                  </button>
                </div>
              </div>
            ) : (
              <label className="admin-image-drop">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploading}
                  hidden
                />
                {uploading ? '업로드 중...' : '이미지 선택 또는 드래그'}
              </label>
            )}
          </div>
          <p className="admin-form-hint">jpg, png, gif, webp (최대 5MB)</p>
        </div>

        <div className="admin-form-actions">
          <button
            type="submit"
            className="admin-btn admin-btn-primary"
            disabled={submitting}
          >
            {submitting ? '저장 중...' : isEdit ? '수정' : '등록'}
          </button>
          <Link to="/admin/products" className="admin-btn admin-btn-outline">
            취소
          </Link>
        </div>
      </form>
    </div>
  );
}

export default AdminProductFormPage;
