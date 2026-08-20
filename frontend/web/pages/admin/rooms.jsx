// pages/admin/rooms.jsx
import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';

export default function AdminRooms() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;

  const fetchRooms = (pageNum = 1) => {
    const token = localStorage.getItem('adminToken');
    if (!token) { window.location.href = '/login'; return; }
    setLoading(true);
    fetch(`https://api.amoramatch.one/admin/rooms?page=${pageNum}&limit=${limit}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => {
        setRooms(data.rooms || []);
        setTotal(data.total || 0);
        setPage(data.page || 1);
        setLoading(false);
      })
      .catch(err => { setError(err.message); setLoading(false); });
  };

  useEffect(() => { fetchRooms(1); }, []);

  const endRoom = (roomId) => {
    if (!confirm('End this room?')) return;
    const token = localStorage.getItem('adminToken');
    fetch(`https://api.amoramatch.one/admin/rooms/${roomId}/end`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(() => fetchRooms(page));
  };

  if (loading) return React.createElement(AdminLayout, null, React.createElement('div', { style: { color: '#fff' } }, 'Loading...'));
  if (error) return React.createElement(AdminLayout, null, React.createElement('div', { style: { color: '#ff6b6b' } }, error));

  return React.createElement(AdminLayout, null,
    React.createElement('div', null, [
      React.createElement('h1', { key: 'title', style: { color: '#FF6B9D' } }, 'Live Rooms'),
      React.createElement('table', { style: { width: '100%', borderCollapse: 'collapse', color: '#fff', background: '#1a1a2e', borderRadius: '8px', overflow: 'hidden', marginTop: '20px' } },
        React.createElement('thead', null,
          React.createElement('tr', { style: { background: '#2a2a3e' } },
            ['Title', 'Host', 'Category', 'Viewers', 'Status', 'Created', 'Actions'].map(h => React.createElement('th', { key: h, style: { padding: '12px 16px', textAlign: 'left' } }, h))
          )
        ),
        React.createElement('tbody', null,
          rooms.length === 0
            ? React.createElement('tr', null, React.createElement('td', { colSpan: 7, style: { padding: '40px', textAlign: 'center', color: '#666' } }, 'No rooms'))
            : rooms.map(room =>
                React.createElement('tr', { key: room.id, style: { borderBottom: '1px solid #222' } },
                  React.createElement('td', { style: { padding: '12px 16px' } }, room.title || 'Untitled'),
                  React.createElement('td', { style: { padding: '12px 16px' } }, room.host?.display_name || room.host?.username || 'Unknown'),
                  React.createElement('td', { style: { padding: '12px 16px' } }, room.category || 'General'),
                  React.createElement('td', { style: { padding: '12px 16px' } }, room.viewer_count || 0),
                  React.createElement('td', { style: { padding: '12px 16px' } },
                    React.createElement('span', { style: { padding: '4px 12px', borderRadius: '12px', fontSize: '12px', background: room.status === 'live' ? '#1a5a2a' : '#5a1a1a', color: room.status === 'live' ? '#8f8' : '#f88' } }, room.status)
                  ),
                  React.createElement('td', { style: { padding: '12px 16px' } }, new Date(room.created_at).toLocaleDateString()),
                  React.createElement('td', { style: { padding: '12px 16px' } },
                    room.status === 'live' && React.createElement('button', {
                      onClick: () => endRoom(room.id),
                      style: { padding: '4px 12px', borderRadius: '4px', border: 'none', background: '#ff4444', color: '#fff', cursor: 'pointer' }
                    }, 'End Room')
                  )
                )
              )
        )
      ),
      React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', marginTop: '20px', color: '#aaa' } },
        React.createElement('span', null, `Showing ${(page-1)*limit+1}–${Math.min(page*limit, total)} of ${total}`),
        React.createElement('div', null,
          React.createElement('button', { disabled: page <= 1, onClick: () => fetchRooms(page-1), style: { padding: '6px 12px', marginRight: '8px', background: page <= 1 ? '#222' : '#2a2a3e', color: page <= 1 ? '#555' : '#fff', border: '1px solid #333', borderRadius: '4px', cursor: page <= 1 ? 'not-allowed' : 'pointer' } }, 'Prev'),
          React.createElement('span', { style: { padding: '6px 12px' } }, `Page ${page}`),
          React.createElement('button', { disabled: page * limit >= total, onClick: () => fetchRooms(page+1), style: { padding: '6px 12px', marginLeft: '8px', background: page * limit >= total ? '#222' : '#2a2a3e', color: page * limit >= total ? '#555' : '#fff', border: '1px solid #333', borderRadius: '4px', cursor: page * limit >= total ? 'not-allowed' : 'pointer' } }, 'Next')
        )
      )
    ])
  );
}
