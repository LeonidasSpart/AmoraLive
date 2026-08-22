// pages/admin/reports.jsx
import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { apiFetch } from '../../lib/api';

const STATUSES = ['pending', 'reviewed', 'dismissed', 'all'];

export default function AdminReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('pending');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [actioning, setActioning] = useState(null);
  const limit = 20;

  const load = async (pageNum = 1, statusFilter = status) => {
    if (!localStorage.getItem('accessToken')) {
      window.location.href = '/login';
      return;
    }
    setLoading(true);
    setError('');
    try {
      const qsStatus = statusFilter === 'all' ? '' : statusFilter;
      const res = await apiFetch(`/admin/reports?page=${pageNum}&limit=${limit}&status=${qsStatus}`);
      if (!res.ok) throw new Error('Failed to fetch reports');
      const data = await res.json();
      setReports(data.reports || []);
      setTotal(data.total || 0);
      setPage(data.page || 1);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(1, status);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const review = async (reportId, newStatus, actionTaken) => {
    setActioning(reportId);
    try {
      const res = await apiFetch(`/admin/reports/${reportId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus, action_taken: actionTaken })
      });
      if (!res.ok) throw new Error('Unable to update this report.');
      await load(page, status);
    } catch (e) {
      setError(e.message);
    } finally {
      setActioning(null);
    }
  };

  return (
    <AdminLayout>
      <h1 style={{ marginBottom: 20 }}>Reports</h1>

      <div style={s.tabs}>
        {STATUSES.map((st) => (
          <button key={st} style={status === st ? s.tabActive : s.tab} onClick={() => setStatus(st)}>
            {st[0].toUpperCase() + st.slice(1)}
          </button>
        ))}
      </div>

      {error && <div style={s.error}>{error}</div>}

      {loading ? (
        <p>Loading…</p>
      ) : reports.length === 0 ? (
        <p style={{ color: '#888' }}>No reports here.</p>
      ) : (
        <>
          <table style={s.table}>
            <thead>
              <tr>
                <th style={s.th}>Reporter</th>
                <th style={s.th}>Reported</th>
                <th style={s.th}>Type</th>
                <th style={s.th}>Category</th>
                <th style={s.th}>Description</th>
                <th style={s.th}>Status</th>
                <th style={s.th}>Filed</th>
                <th style={s.th}></th>
              </tr>
            </thead>
            <tbody>
              {reports.map((r) => (
                <tr key={r.id}>
                  <td style={s.td}>{r.reporter?.display_name || r.reporter?.username}</td>
                  <td style={s.td}>{r.reported?.display_name || r.reported?.username}</td>
                  <td style={s.td}>{r.target_type}</td>
                  <td style={s.td}>{r.category}</td>
                  <td style={{ ...s.td, maxWidth: 220 }}>{r.description || '—'}</td>
                  <td style={s.td}>
                    <span style={{ ...s.badge, ...(r.status === 'pending' ? s.badgePending : r.status === 'dismissed' ? s.badgeDismissed : s.badgeReviewed) }}>
                      {r.status}
                    </span>
                  </td>
                  <td style={s.td}>{new Date(r.created_at).toLocaleDateString()}</td>
                  <td style={s.td}>
                    {r.status === 'pending' && (
                      <>
                        <button style={s.smallBtn} disabled={actioning === r.id} onClick={() => review(r.id, 'reviewed', 'Action taken by moderator')}>
                          Take action
                        </button>
                        <button style={{ ...s.smallBtn, marginLeft: 6 }} disabled={actioning === r.id} onClick={() => review(r.id, 'dismissed', null)}>
                          Dismiss
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={s.pagination}>
            <span>Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total}</span>
            <div>
              <button disabled={page <= 1} onClick={() => load(page - 1, status)} style={s.pageBtn}>Prev</button>
              <span style={{ padding: '6px 12px' }}>Page {page}</span>
              <button disabled={page * limit >= total} onClick={() => load(page + 1, status)} style={s.pageBtn}>Next</button>
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  );
}

const s = {
  tabs: { display: 'flex', gap: 8, marginBottom: 20 },
  tab: { background: 'transparent', border: '1px solid #333', color: '#aaa', padding: '6px 16px', borderRadius: 16, cursor: 'pointer', fontSize: 13 },
  tabActive: { background: 'linear-gradient(135deg, #ff3f9d 0%, #ff5da8 35%, #9b35ff 100%)', border: '1px solid #FF6B9D', color: '#fff', padding: '6px 16px', borderRadius: 16, cursor: 'pointer', fontSize: 13 },
  error: { color: '#ff6b6b', marginBottom: 12 },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', borderBottom: '1px solid #333', padding: 8, color: '#999', fontSize: 13 },
  td: { borderBottom: '1px solid #222', padding: 8, fontSize: 13 },
  badge: { padding: '3px 10px', borderRadius: 10, fontSize: 11 },
  badgePending: { background: '#5a4a1a', color: '#ffd45c' },
  badgeReviewed: { background: '#1a5a2a', color: '#8f8' },
  badgeDismissed: { background: '#333', color: '#999' },
  smallBtn: { background: 'transparent', border: '1px solid #444', color: '#ccc', padding: '4px 10px', borderRadius: 6, cursor: 'pointer', fontSize: 12 },
  pagination: { display: 'flex', justifyContent: 'space-between', marginTop: 20, color: '#aaa' },
  pageBtn: { padding: '6px 12px', margin: '0 4px', background: '#2a2a3e', color: '#fff', border: '1px solid #333', borderRadius: 4, cursor: 'pointer' }
};
