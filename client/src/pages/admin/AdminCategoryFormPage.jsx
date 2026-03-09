import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { getCategory, createCategory, updateCategory } from '../../utils/api';
import './AdminProductFormPage.css';

const ICON_OPTIONS = ['👕', '💄', '📱', '🏠', '📦', '👟', '👜', '⌚', '🎧', '🍎'];

function AdminCategoryFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [loading, setLoading] = useState(isEdit);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    id: '',
    label: '',
    icon: '📦',
    order: 0,
  });

  useEffect(() => {
    if (isEdit) {
      loadCategory();
    }
  }, [id, isEdit]);

  async function loadCategory() {
    setLoading(true);
    setError('');
    try {
      const data = await getCategory(id);
      setForm({
        id: data.id || '',
        label: data.label || '',
        icon: data.icon || '📦',
        order: data.order ?? 0,
      });
    } catch (err) {
      setError(err.message || '카테고리 정보를 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e) {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? 0 : Number(value)) : value,
    }));
    setError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!form.id.trim()) {
      setError('카테고리 ID를 입력해 주세요.');
      return;
    }
    if (!form.label.trim()) {
      setError('카테고리명을 입력해 주세요.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        id: form.id.trim(),
        label: form.label.trim(),
        icon: form.icon.trim() || '📦',
        order: Number(form.order) || 0,
      };
      if (isEdit) {
        await updateCategory(id, payload);
        navigate('/admin/categories');
      } else {
        await createCategory(payload);
        navigate('/admin/categories');
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
          {isEdit ? '카테고리 수정' : '카테고리 추가'}
        </h1>
        <Link to="/admin/categories" className="admin-btn admin-btn-outline">
          목록으로
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="admin-form">
        {error && <p className="admin-error">{error}</p>}

        <div className="admin-form-group">
          <label htmlFor="id">카테고리 ID *</label>
          <input
            id="id"
            name="id"
            type="text"
            value={form.id}
            onChange={handleChange}
            placeholder="예: fashion"
            disabled={isEdit}
            required
          />
          {isEdit && <p className="admin-form-hint">ID는 수정할 수 없습니다.</p>}
        </div>

        <div className="admin-form-group">
          <label htmlFor="label">카테고리명 *</label>
          <input
            id="label"
            name="label"
            type="text"
            value={form.label}
            onChange={handleChange}
            placeholder="예: 패션"
            required
          />
        </div>

        <div className="admin-form-group">
          <label>아이콘</label>
          <div className="admin-icon-picker">
            {ICON_OPTIONS.map((ico) => (
              <button
                key={ico}
                type="button"
                className={`admin-icon-btn ${form.icon === ico ? 'active' : ''}`}
                onClick={() => setForm((p) => ({ ...p, icon: ico }))}
              >
                {ico}
              </button>
            ))}
          </div>
          <input
            name="icon"
            type="text"
            value={form.icon}
            onChange={handleChange}
            placeholder="이모지 직접 입력"
            maxLength={4}
            className="admin-icon-input"
          />
        </div>

        <div className="admin-form-group">
          <label htmlFor="order">표시 순서</label>
          <input
            id="order"
            name="order"
            type="number"
            min="0"
            value={form.order}
            onChange={handleChange}
          />
          <p className="admin-form-hint">숫자가 작을수록 먼저 표시됩니다.</p>
        </div>

        <div className="admin-form-actions">
          <button
            type="submit"
            className="admin-btn admin-btn-primary"
            disabled={submitting}
          >
            {submitting ? '저장 중...' : isEdit ? '수정' : '추가'}
          </button>
          <Link to="/admin/categories" className="admin-btn admin-btn-outline">
            취소
          </Link>
        </div>
      </form>
    </div>
  );
}

export default AdminCategoryFormPage;
