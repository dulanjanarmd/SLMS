import React, { useState, useEffect } from 'react';
import { categoryAPI, bookAPI } from '../services/api';

const inputStyle = {
  borderRadius: 12,
  padding: '11px 14px',
  fontFamily: 'Poppins, sans-serif',
  background: '#f8fafc',
  border: '1.5px solid #e5e7eb',
  fontSize: '0.88rem',
  color: '#1f2937',
  outline: 'none',
  width: '100%',
  transition: 'all 0.18s',
};

const focusStyle = { borderColor: '#ef5a24', boxShadow: '0 0 0 3px rgba(239,90,36,0.12)', background: '#fff' };

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [focusField, setFocusField] = useState(null);
  
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  
  const [formData, setFormData] = useState({ name: '', description: '' });

  useEffect(() => { fetchCategories(); }, []);

  useEffect(() => {
    if (searchKeyword.trim() === '') {
      setFilteredCategories(categories);
    } else {
      const keyword = searchKeyword.toLowerCase();
      const filtered = categories.filter(category => 
        category.name?.toLowerCase().includes(keyword) ||
        category.description?.toLowerCase().includes(keyword)
      );
      setFilteredCategories(filtered);
    }
  }, [searchKeyword, categories]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await categoryAPI.getAll();
      const categoriesData = Array.isArray(response.data) ? response.data : [];
      
      const categoriesWithCounts = await Promise.all(
        categoriesData.map(async (category) => {
          try {
            const booksResponse = await bookAPI.getAll({ page: 0, size: 1000 });
            const books = booksResponse.data.content || booksResponse.data || [];
            const bookCount = books.filter(book => book.categoryId === category.id).length;
            return { ...category, bookCount };
          } catch (err) {
            return { ...category, bookCount: 0 };
          }
        })
      );
      
      setCategories(categoriesWithCounts);
      setFilteredCategories(categoriesWithCounts);
    } catch (err) {
      setError('Failed to load categories');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchKeyword(e.target.value);
  };

  const openAddModal = () => {
    setEditMode(false);
    setSelectedCategory(null);
    setFormData({ name: '', description: '' });
    setShowFormModal(true);
  };

  const openEditModal = (category) => {
    setEditMode(true);
    setSelectedCategory(category);
    setFormData({ name: category.name || '', description: category.description || '' });
    setShowFormModal(true);
  };

  const openDeleteModal = (category) => {
    setSelectedCategory(category);
    setShowDeleteModal(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError(''); setSuccess('');
      const payload = { name: formData.name.trim(), description: formData.description.trim() };
      console.log('Submitting category:', payload);
      if (editMode && selectedCategory) {
        await categoryAPI.update(selectedCategory.id, payload);
        setSuccess('Category updated successfully!');
      } else {
        await categoryAPI.add(payload);
        setSuccess('Category added successfully!');
      }
      setShowFormModal(false);
      fetchCategories();
    } catch (err) {
      console.error('Category creation error:', err);
      console.error('Error response:', err.response);
      setError(err.response?.data?.message || err.message || 'Operation failed');
    }
  };

  const handleDelete = async () => {
    try {
      setError(''); setSuccess('');
      await categoryAPI.delete(selectedCategory.id);
      setSuccess('Category deleted successfully!');
      setShowDeleteModal(false);
      fetchCategories();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete category. It may have associated books.');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  if (loading && categories.length === 0) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', fontFamily: 'Poppins, sans-serif' }}>
      <div style={{ width: 40, height: 40, border: '3px solid #f3f3f3', borderTop: '3px solid #ef5a24', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
    </div>
  );

  return (
    <div style={{ padding: '0 20px 24px 20px', maxWidth: 1400, margin: '0 auto', fontFamily: 'Poppins, sans-serif' }}>
      <div style={{
        background: 'linear-gradient(135deg, #1a1a2e 0%, #2d1b69 50%, #ef5a24 100%)',
        borderRadius: 20, padding: '32px 40px', color: 'white',
        marginBottom: 28, position: 'relative', overflow: 'hidden',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: -60, right: 80, width: 150, height: 150, background: 'rgba(255,255,255,0.04)', borderRadius: '50%' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', opacity: 0.7, marginBottom: 8 }}>
            Admin Portal
          </div>
          <h1 style={{ fontWeight: 800, fontSize: '1.8rem', margin: 0, marginBottom: 8 }}>Category Management</h1>
          <p style={{ opacity: 0.75, margin: 0, fontSize: '0.9rem' }}>
            Manage book categories and organize your library catalog
          </p>
        </div>
        <button onClick={openAddModal} style={{
          background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)',
          color: 'white', borderRadius: 10, padding: '10px 20px', cursor: 'pointer',
          fontWeight: 600, fontSize: '0.85rem', fontFamily: 'Poppins, sans-serif',
          position: 'relative', zIndex: 1, backdropFilter: 'blur(8px)',
        }}>
          Add Category
        </button>
      </div>

      {error && (
        <div style={{ marginBottom: 20, borderRadius: 14, background: 'linear-gradient(135deg, rgba(239,68,68,0.1), rgba(239,68,68,0.04))', border: '1px solid #ef444440', color: '#991b1b', padding: '12px 18px', fontWeight: 600, fontSize: '0.88rem' }}>
          {error}
        </div>
      )}
      {success && (
        <div style={{ marginBottom: 20, borderRadius: 14, background: 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(16,185,129,0.04))', border: '1px solid #10b98140', color: '#065f46', padding: '12px 18px', fontWeight: 600, fontSize: '0.88rem' }}>
          {success}
        </div>
      )}

      <div style={{ background: 'white', borderRadius: 20, padding: '20px 22px', border: '1px solid #e8ecf0', boxShadow: '0 12px 40px rgba(0,0,0,0.05)', marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Search categories..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            onFocus={() => setFocusField('search')}
            onBlur={() => setFocusField(null)}
            style={{ ...inputStyle, ...(focusField === 'search' ? focusStyle : {}) }}
          />
          {searchKeyword && (
            <button onClick={() => setSearchKeyword('')} style={{
              padding: '11px 20px', borderRadius: 999,
              background: 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(139,92,246,0.06))',
              border: '1.5px solid #6366f130',
              color: '#4f46e5', fontWeight: 700, fontSize: '0.82rem',
              cursor: 'pointer', fontFamily: 'Poppins, sans-serif',
            }}>Clear</button>
          )}
        </div>
      </div>

      <div style={{ background: 'white', borderRadius: 20, border: '1px solid #e8ecf0', boxShadow: '0 12px 40px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <div style={{ padding: '18px 26px', background: 'linear-gradient(135deg, rgba(99,102,241,0.06), rgba(139,92,246,0.03))', display: 'grid', gridTemplateColumns: '2fr 2fr 140px 140px 140px', gap: 14, alignItems: 'center', fontWeight: 700, fontSize: '0.78rem', color: '#4c1d95', textTransform: 'uppercase', letterSpacing: 0.6, borderBottom: '1px solid #eef2ff' }}>
          <div>Name</div>
          <div>Description</div>
          <div style={{ textAlign: 'center' }}>Book Count</div>
          <div>Created Date</div>
          <div style={{ textAlign: 'right' }}>Actions</div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{ width: 40, height: 40, border: '3px solid #f3f3f3', borderTop: '3px solid #ef5a24', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }}></div>
            <div style={{ marginTop: 14, color: '#64748b', fontSize: '0.88rem' }}>Loading categories...</div>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div style={{ padding: '60px 40px', textAlign: 'center' }}>
            <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1a1a2e', marginBottom: 6 }}>
              {searchKeyword ? 'No categories match your search' : 'No categories found'}
            </div>
            <div style={{ color: '#64748b', fontSize: '0.88rem' }}>
              {searchKeyword ? 'Try a different search term.' : 'Get started by adding your first category.'}
            </div>
          </div>
        ) : (
          filteredCategories.map((category) => (
            <div key={category.id} style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 140px 140px 140px', gap: 14, alignItems: 'center', padding: '16px 26px', borderBottom: '1px solid #f1f5f9', transition: 'background 0.15s' }} onMouseEnter={e => e.currentTarget.style.background = '#fafbff'} onMouseLeave={e => e.currentTarget.style.background = 'white'}>
              <div style={{ fontWeight: 600, color: '#1a1a2e', fontSize: '0.9rem' }}>{category.name}</div>
              <div style={{ color: '#64748b', fontSize: '0.85rem' }}>{category.description || <span style={{ fontStyle: 'italic', color: '#9ca3af' }}>No description</span>}</div>
              <div style={{ textAlign: 'center' }}><span style={{ background: category.bookCount > 0 ? 'rgba(59,130,246,0.1)' : 'rgba(100,116,139,0.1)', color: category.bookCount > 0 ? '#2563eb' : '#475569', borderRadius: 6, padding: '3px 10px', fontSize: '0.75rem', fontWeight: 700 }}>{category.bookCount || 0} books</span></div>
              <div style={{ color: '#374151', fontSize: '0.82rem' }}>{formatDate(category.createdAt)}</div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                <button onClick={() => openEditModal(category)} style={{ padding: '7px 14px', borderRadius: 999, cursor: 'pointer', background: 'linear-gradient(135deg, #1a1a2e, #2d1b69)', color: 'white', border: 'none', fontSize: '0.74rem', fontWeight: 700, fontFamily: 'Poppins, sans-serif', transition: 'transform 0.15s' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'} onMouseLeave={e => e.currentTarget.style.transform = ''}>
                  Edit
                </button>
                <button onClick={() => openDeleteModal(category)} style={{ padding: '7px 12px', borderRadius: 999, cursor: 'pointer', background: 'rgba(239,68,68,0.1)', color: '#dc2626', border: '1px solid #ef444440', fontSize: '0.72rem', fontWeight: 700, fontFamily: 'Poppins, sans-serif', transition: 'transform 0.15s' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'} onMouseLeave={e => e.currentTarget.style.transform = ''}>
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div style={{ marginTop: 20, color: '#64748b', fontSize: '0.85rem' }}>
        Showing {filteredCategories.length} of {categories.length} categories
      </div>

      {showFormModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(17,24,39,0.55)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={e => { if (e.target === e.currentTarget) setShowFormModal(false); }}>
          <div style={{ width: '100%', maxWidth: 500, background: 'white', borderRadius: 20, overflow: 'hidden', boxShadow: '0 30px 80px rgba(0,0,0,0.3)' }}>
            <div style={{ padding: '22px 30px', background: 'linear-gradient(135deg, #1a1a2e 0%, #2d1b69 45%, #ef5a24 100%)', color: 'white' }}>
              <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800 }}>{editMode ? 'Edit Category' : 'Add New Category'}</h2>
              <p style={{ margin: '4px 0 0', opacity: 0.78, fontSize: '0.8rem' }}>{editMode ? 'Update the category details below.' : 'Create a new category to organize your books.'}</p>
            </div>
            <form onSubmit={handleSubmit}>
              <div style={{ padding: '26px 30px' }}>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, fontSize: '0.85rem', color: '#374151' }}>Category Name <span style={{ color: '#ef4444' }}>*</span></label>
                  <input type="text" name="name" value={formData.name} onChange={handleFormChange} placeholder="Enter category name" required maxLength={100} style={inputStyle} />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, fontSize: '0.85rem', color: '#374151' }}>Description</label>
                  <textarea name="description" value={formData.description} onChange={handleFormChange} rows={3} placeholder="Enter category description (optional)" maxLength={500} style={{ ...inputStyle, resize: 'vertical' }} />
                  <div style={{ marginTop: 6, color: '#64748b', fontSize: '0.75rem' }}>{formData.description.length}/500 characters</div>
                </div>
              </div>
              <div style={{ padding: '16px 30px', borderTop: '1px solid #f1f5f9', display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowFormModal(false)} style={{ padding: '10px 20px', borderRadius: 999, background: '#f1f5f9', border: '1px solid #e8ecf0', color: '#374151', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'Poppins, sans-serif' }}>
                  Cancel
                </button>
                <button type="submit" style={{ padding: '10px 20px', borderRadius: 999, background: 'linear-gradient(135deg, #ef5a24, #ff8c5a)', border: 'none', color: 'white', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'Poppins, sans-serif' }}>
                  {editMode ? 'Update Category' : 'Add Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(17,24,39,0.55)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={e => { if (e.target === e.currentTarget) setShowDeleteModal(false); }}>
          <div style={{ width: '100%', maxWidth: 500, background: 'white', borderRadius: 20, overflow: 'hidden', boxShadow: '0 30px 80px rgba(0,0,0,0.3)' }}>
            <div style={{ padding: '22px 30px', background: 'linear-gradient(135deg, #1a1a2e 0%, #2d1b69 45%, #ef5a24 100%)', color: 'white' }}>
              <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800 }}>Confirm Deletion</h2>
              <p style={{ margin: '4px 0 0', opacity: 0.78, fontSize: '0.8rem' }}>Are you sure you want to delete this category?</p>
            </div>
            <div style={{ padding: '26px 30px' }}>
              {selectedCategory && (
                <div style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid #f59e0b40', borderRadius: 12, padding: '16px', marginBottom: 16 }}>
                  <div style={{ fontWeight: 700, color: '#1a1a2e', fontSize: '0.95rem' }}>{selectedCategory.name}</div>
                  <div style={{ color: '#64748b', fontSize: '0.85rem' }}>
                    {selectedCategory.bookCount > 0 
                      ? `This category has ${selectedCategory.bookCount} associated book(s)`
                      : 'This category has no associated books'}
                  </div>
                </div>
              )}
              {selectedCategory?.bookCount > 0 && (
                <div style={{ color: '#dc2626', fontSize: '0.85rem', marginBottom: 0 }}>
                  Warning: Deleting this category may affect associated books. Please reassign books to another category first.
                </div>
              )}
            </div>
            <div style={{ padding: '16px 30px', borderTop: '1px solid #f1f5f9', display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowDeleteModal(false)} style={{ padding: '10px 20px', borderRadius: 999, background: '#f1f5f9', border: '1px solid #e8ecf0', color: '#374151', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'Poppins, sans-serif' }}>
                Cancel
              </button>
              <button onClick={handleDelete} style={{ padding: '10px 20px', borderRadius: 999, background: 'linear-gradient(135deg, #ef4444, #dc2626)', border: 'none', color: 'white', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'Poppins, sans-serif' }}>
                Delete Category
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default Categories;
