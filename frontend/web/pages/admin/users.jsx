import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const limit = 20;

  const fetchUsers = (pageNum = 1, searchTerm = '') => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      window.location.href = '/login';
      return;
    }
    setLoading(true);
    fetch(
      `https://api.amoramatch.one/admin/users?page=${pageNum}&limit=${limit}&search=${encodeURIComponent(searchTerm)}`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    )
      .then(r => r.json())
      .then(data => {
        setUsers(data.users || []);
        setTotal(data.total || 0);
        setPage(data.page || 1);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers(1, '');
  }, []);

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
      .then(r => r.json())
      .then(() => fetchUsers(page, search));
  };

  const deleteUser = (userId) => {
    if (!confirm('Delete this user permanently?')) return;
    const token = localStorage.getItem('adminToken');
    fetch(`https://api.amoramatch.one/admin/users/${userId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(() => fetchUsers(page, search));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchUsers(1, search);
  };

  if (loading) {
    return React.createElement(AdminLayout, null,
      React.createElement('div', { style: { color: '#fff' } }, 'Loading users...')
    );
  }

  return React.createElement(AdminLayout, null,
    React.createElement('div', null, [
      // Header
      React.createElement('div', { key: 'header', style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' } },
        React.createElement('h1', { style: { color: '#FF6B9D' } }, 'Users'),
        React.createElement('form', {
          onSubmit: handleSearch,
          style: { display: 'flex', gap: '10px' }
        }, [
          React.createElement('input', {
            key: 'search',
            type: 'text',
            placeholder: 'Search users...',
            value: search,
            onChange: (e) => setSearch(e.target.value),
            style: {
              padding: '8px 12px',
              borderRadius: '6px',
              border: '1px solid #333',
              background: '#1a1a2e',
              color: '#fff',
              width: '250px'
            }
          }),
          React.createElement('button', {
            key: 'btn',
            type: 'submit',
            style: {
              padding: '8px 16px',
              borderRadius: '6px',
              border: 'none',
              background: '#FF6B9D',
              color: '#fff',
              cursor: 'pointer'
            }
          }, 'Search')
        ])
      ),

      // Table
      React.createElement('table', {
        key: 'table',
        style: {
          width: '100%',
          borderCollapse: 'collapse',
          color: '#fff',
          background: '#1a1a2e',
          borderRadius: '8px',
          overflow: 'hidden'
        }
      }, [
        React.createElement('thead', { key: 'head' },
          React.createElement('tr', { style: { background: '#2a2a3e' } },
            ['Username', 'Email', 'Role', 'Level', 'Status', 'Actions'].map(h =>
              React.createElement('th', {
                key: h,
                style: { padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid #333' }
              }, h)
            )
          )
        ),
        React.createElement('tbody', { key: 'body' },
          users.length === 0
            ? React.createElement('tr', null,
                React.createElement('td', {
                  colSpan: 6,
                  style: { padding: '40px', textAlign: 'center', color: '#666' }
                }, 'No users found')
              )
            : users.map(user =>
                React.createElement('tr', {
                  key: user.id,
                  style: { borderBottom: '1px solid #222', transition: 'background 0.2s' },
                  onMouseEnter: (e) => e.currentTarget.style.background = '#252540',
                  onMouseLeave: (e) => e.currentTarget.style.background = 'transparent'
                }, [
                  React.createElement('td', { key: 'username', style: { padding: '12px 16px' } }, user.username),
                  React.createElement('td', { key: 'email', style: { padding: '12px 16px' } }, user.email),
                  React.createElement('td', { key: 'role', style: { padding: '12px 16px' } },
                    React.createElement('select', {
                      value: user.role || 'user',
                      onChange: (e) => updateRole(user.id, e.target.value),
                      style: {
                        background: '#1e1e32',
                        color: '#fff',
                        border: '1px solid #333',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }
                    }, [
                      ['user', 'User'],
                      ['admin', 'Admin'],
                      ['superadmin', 'Super Admin']
                    ].map(([val, label]) =>
                      React.createElement('option', { key: val, value: val }, label)
                    ))
                  ),
                  React.createElement('td', { key: 'level', style: { padding: '12px 16px' } }, user.level || 0),
                  React.createElement('td', { key: 'status', style: { padding: '12px 16px' } },
                    React.createElement('span', {
                      style: {
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        background: user.is_active ? '#1a5a2a' : '#5a1a1a',
                        color: user.is_active ? '#8f8' : '#f88'
                      }
                    }, user.is_active ? 'Active' : 'Suspended')
                  ),
                  React.createElement('td', { key: 'actions', style: { padding: '12px 16px', display: 'flex', gap: '8px' } }, [
                    React.createElement('button', {
                      key: 'toggle',
                      onClick: () => toggleStatus(user.id, user.is_active),
                      style: {
                        padding: '4px 12px',
                        borderRadius: '4px',
                        border: 'none',
                        background: user.is_active ? '#ffaa44' : '#44aa44',
                        color: '#fff',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }
                    }, user.is_active ? 'Suspend' : 'Activate'),
                    React.createElement('button', {
                      key: 'delete',
                      onClick: () => deleteUser(user.id),
                      style: {
                        padding: '4px 12px',
                        borderRadius: '4px',
                        border: 'none',
                        background: '#ff4444',
                        color: '#fff',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }
                    }, 'Delete')
                  ])
                ])
              )
        )
      ]),

      // Pagination
      React.createElement('div', {
        key: 'pagination',
        style: {
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '20px',
          color: '#aaa'
        }
      }, [
        React.createElement('span', { key: 'info' },
          `Showing ${(page - 1) * limit + 1}–${Math.min(page * limit, total)} of ${total} users`
        ),
        React.createElement('div', { key: 'buttons', style: { display: 'flex', gap: '8px' } }, [
          React.createElement('button', {
            key: 'prev',
            disabled: page <= 1,
            onClick: () => fetchUsers(page - 1, search),
            style: {
              padding: '6px 12px',
              borderRadius: '4px',
              border: '1px solid #333',
              background: page <= 1 ? '#222' : '#2a2a3e',
              color: page <= 1 ? '#555' : '#fff',
              cursor: page <= 1 ? 'not-allowed' : 'pointer'
            }
          }, 'Previous'),
          React.createElement('span', {
            key: 'page',
            style: { padding: '6px 12px', color: '#fff' }
          }, `Page ${page}`),
          React.createElement('button', {
            key: 'next',
            disabled: page * limit >= total,
            onClick: () => fetchUsers(page + 1, search),
            style: {
              padding: '6px 12px',
              borderRadius: '4px',
              border: '1px solid #333',
              background: page * limit >= total ? '#222' : '#2a2a3e',
              color: page * limit >= total ? '#555' : '#fff',
              cursor: page * limit >= total ? 'not-allowed' : 'pointer'
            }
          }, 'Next')
        ])
      ])
    ])
  );
}
