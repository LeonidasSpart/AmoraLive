// pages/admin/users.jsx
import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const limit = 20;

  const fetchUsers = (pageNum = 1, searchTerm = '') => {
    const token = localStorage.getItem('adminToken');
    if (!token) { window.location.href = '/login'; return; }
    setLoading(true);
    fetch(`https://api.amoramatch.one/admin/users?page=${pageNum}&limit=${limit}&search=${encodeURIComponent(searchTerm)}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => {
        setUsers(data.users || []);
        setTotal(data.total || 0);
        setPage(data.page || 1);
        setLoading(false);
      })
      .catch(err => { setError(err.message); setLoading(false); });
  };

  useEffect(() => { fetchUsers(1, ''); }, []);

  const updateRole = (userId, role) => {
    const token = localStorage.getItem('adminToken');
    fetch(`https://api.amoramatch.one/admin/users/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ role })
    })
      .then(r => r.json())
      .then(() => fetchUsers(page, search));
  };

  const toggleStatus = (userId, currentStatus) => {
    const token = localStorage.getItem('adminToken');
    fetch(`https://api.amoramatch.one/admin/users/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ is_active: !currentStatus })
    })
      .then(() => fetchUsers(page, search));
  };

  const deleteUser = (userId) => {
    if (!confirm('Delete this user?')) return;
    const token = localStorage.getItem('adminToken');
    fetch(`https://api.amoramatch.one/admin/users/${userId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
      .then(() => fetchUsers(page, search));
  };

  const handleSearch = (e) => { e.preventDefault(); fetchUsers(1, search); };

  if (loading) return React.createElement(AdminLayout, null, React.createElement('div', { style: { color: '#fff' } }, 'Loading...'));
  if (error) return React.createElement(AdminLayout, null, React.createElement('div', { style: { color: '#ff6b6b' } }, error));

  return React.createElement(AdminLayout, null,
    React.createElement('div', null, [
      React.createElement('div', { key: 'header', style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' } },
        React.createElement('h1', { style: { color: '#FF6B9D' } }, 'Users'),
        React.createElement('form', { onSubmit: handleSearch, style: { display: 'flex', gap: '10px' } },
          React.createElement('input', { type: 'text', placeholder: 'Search...', value: search, onChange: (e) => setSearch(e.target.value), style: { padding: '8px', borderRadius: '6px', border: '1px solid #333', background: '#1a1a2e', color: '#fff' } }),
          React.createElement('button', { type: 'submit', style: { padding: '8px 16px', background: '#FF6B9D', border: 'none', borderRadius: '6px', color: '#fff', cursor: 'pointer' } }, 'Search')
        )
      ),
      React.createElement('table', { style: { width: '100%', borderCollapse: 'collapse', color: '#fff', background: '#1a1a2e', borderRadius: '8px', overflow: 'hidden' } },
        React.createElement('thead', null,
          React.createElement('tr', { style: { background: '#2a2a3e' } },
            ['Username', 'Email', 'Role', 'Level', 'Status', 'Actions'].map(h => React.createElement('th', { key: h, style: { padding: '12px 16px', textAlign: 'left' } }, h))
          )
        ),
        React.createElement('tbody', null,
          users.length === 0
            ? React.createElement('tr', null, React.createElement('td', { colSpan: 6, style: { padding: '40px', textAlign: 'center', color: '#666' } }, 'No users'))
            : users.map(user =>
                React.createElement('tr', { key: user.id, style: { borderBottom: '1px solid #222' } },
                  React.createElement('td', { style: { padding: '12px 16px' } }, user.username),
                  React.createElement('td', { style: { padding: '12px 16px' } }, user.email),
                  React.createElement('td', { style: { padding: '12px 16px' } },
                    React.createElement('select', {
                      value: user.role || 'user',
                      onChange: (e) => updateRole(user.id, e.target.value),
                      style: { background: '#1a1a2e', color: '#fff', border: '1px solid #333', padding: '4px 8px', borderRadius: '4px' }
                    }, ['user', 'admin', 'superadmin'].map(r => React.createElement('option', { key: r, value: r }, r))
                  )),
                  React.createElement('td', { style: { padding: '12px 16px' } }, user.level || 0),
                  React.createElement('td', { style: { padding: '12px 16px' } },
                    React.createElement('span', {
                      style: { padding: '4px 12px', borderRadius: '12px', fontSize: '12px', background: user.is_active ? '#1a5a2a' : '#5a1a1a', color: user.is_active ? '#8f8' : '#f88' }
                    }, user.is_active ? 'Active' : 'Suspended')
                  ),
                  React.createElement('td', { style: { padding: '12px 16px' } },
                    React.createElement('button', { onClick: () => toggleStatus(user.id, user.is_active), style: { padding: '4px 12px', borderRadius: '4px', border: 'none', background: user.is_active ? '#ffaa44' : '#44aa44', color: '#fff', cursor: 'pointer', marginRight: '8px' } }, user.is_active ? 'Suspend' : 'Activate'),
                    React.createElement('button', { onClick: () => deleteUser(user.id), style: { padding: '4px 12px', borderRadius: '4px', border: 'none', background: '#ff4444', color: '#fff', cursor: 'pointer' } }, 'Delete')
                  )
                )
              )
        )
      ),
      React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', marginTop: '20px', color: '#aaa' } },
        React.createElement('span', null, `Showing ${(page-1)*limit+1}–${Math.min(page*limit, total)} of ${total}`),
        React.createElement('div', null,
          React.createElement('button', { disabled: page <= 1, onClick: () => fetchUsers(page-1, search), style: { padding: '6px 12px', marginRight: '8px', background: page <= 1 ? '#222' : '#2a2a3e', color: page <= 1 ? '#555' : '#fff', border: '1px solid #333', borderRadius: '4px', cursor: page <= 1 ? 'not-allowed' : 'pointer' } }, 'Prev'),
          React.createElement('span', { style: { padding: '6px 12px' } }, `Page ${page}`),
          React.createElement('button', { disabled: page * limit >= total, onClick: () => fetchUsers(page+1, search), style: { padding: '6px 12px', marginLeft: '8px', background: page * limit >= total ? '#222' : '#2a2a3e', color: page * limit >= total ? '#555' : '#fff', border: '1px solid #333', borderRadius: '4px', cursor: page * limit >= total ? 'not-allowed' : 'pointer' } }, 'Next')
        )
      )
    ])
  );
}
