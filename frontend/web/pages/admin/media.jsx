// pages/admin/media.jsx
import React, { useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { apiFetch } from '../../lib/api';

function formatBytes(bytes) {
  if (!bytes) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  let i = 0;
  let n = bytes;
  while (n >= 1024 && i < units.length - 1) {
    n /= 1024;
    i++;
  }
  return `${n.toFixed(1)} ${units[i]}`;
}

export default function AdminMedia() {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [selected, setSelected] = useState(new Set());
  const [deleting, setDeleting] = useState(false);

  const scan = async () => {
    if (!localStorage.getItem('accessToken')) {
      window.location.href = '/login';
      return;
    }
    setScanning(true);
    setError('');
    setMessage('');
    setSelected(new Set());
    try {
      const res = await apiFetch('/admin/media/orphans');
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Unable to scan for orphaned media.');
      setResult(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setScanning(false);
    }
  };

  const toggle = (key) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };

  const selectAll = () => setSelected(new Set(result?.orphans.map((f) => f.key) || []));
  const clearSelection = () => setSelected(new Set());

  const deleteSelected = async () => {
    if (selected.size === 0) return;
    if (!confirm(`Permanently delete ${selected.size} file${selected.size === 1 ? '' : 's'} from UploadThing? This cannot be undone.`)) return;
    setDeleting(true);
    setError('');
    try {
      const res = await apiFetch('/admin/media/orphans/delete', {
        method: 'POST',
        body: JSON.stringify({ keys: [...selected] })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Unable to delete selected files.');
      setMessage(`Deleted ${data.deletedCount} file${data.deletedCount === 1 ? '' : 's'}.${data.skipped ? ` ${data.skipped} were skipped (no longer orphaned).` : ''}`);
      await scan();
    } catch (e) {
      setError(e.message);
    } finally {
      setDeleting(false);
    }
  };

  const totalOrphanSize = result?.orphans.reduce((sum, f) => sum + (f.size || 0), 0) || 0;

  return (
    <AdminLayout>
      <h1 style={{ color: '#FF6B9D', marginBottom: 4 }}>Orphaned Media</h1>
      <p style={{ color: '#888', fontSize: 13, marginBottom: 20 }}>
        Files still sitting in UploadThing that nothing in the app references anymore — deleted stories,
        replaced profile photos, or anything removed before the automatic cleanup existed. New deletes/replaces
        clean up after themselves now; this is for clearing out what's already there.
      </p>

      {!result && !scanning && (
        <button onClick={scan} style={styles.scanBtn}>🔍 Scan for orphaned files</button>
      )}
      {scanning && <p style={{ color: '#999' }}>Scanning UploadThing and cross-referencing the database…</p>}

      {error && <div style={styles.error}>{error}</div>}
      {message && <div style={styles.success}>{message}</div>}

      {result && !scanning && (
        <>
          <div style={styles.summaryRow}>
            <div style={styles.summaryCard}>
              <div style={styles.summaryValue}>{result.totalFiles}</div>
              <div style={styles.summaryLabel}>Total files in UploadThing</div>
            </div>
            <div style={styles.summaryCard}>
              <div style={{ ...styles.summaryValue, color: '#8f8' }}>{result.referencedCount}</div>
              <div style={styles.summaryLabel}>Still referenced</div>
            </div>
            <div style={styles.summaryCard}>
              <div style={{ ...styles.summaryValue, color: '#ff8080' }}>{result.orphans.length}</div>
              <div style={styles.summaryLabel}>Orphaned</div>
            </div>
            <div style={styles.summaryCard}>
              <div style={{ ...styles.summaryValue, color: '#ffd166' }}>{formatBytes(totalOrphanSize)}</div>
              <div style={styles.summaryLabel}>Reclaimable storage</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
            <button onClick={scan} style={styles.secondaryBtn}>↻ Rescan</button>
            {result.orphans.length > 0 && (
              <>
                <button onClick={selectAll} style={styles.secondaryBtn}>Select all</button>
                <button onClick={clearSelection} style={styles.secondaryBtn}>Clear selection</button>
                <button onClick={deleteSelected} disabled={selected.size === 0 || deleting} style={styles.deleteBtn}>
                  {deleting ? 'Deleting…' : `🗑 Delete selected (${selected.size})`}
                </button>
              </>
            )}
          </div>

          {result.orphans.length === 0 ? (
            <p style={{ color: '#8f8' }}>✓ No orphaned files found — everything in UploadThing is still referenced.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {result.orphans.map((f) => (
                <label key={f.key} style={styles.fileRow}>
                  <input type="checkbox" checked={selected.has(f.key)} onChange={() => toggle(f.key)} />
                  <span style={{ flex: 1, color: '#eee', fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name || f.key}</span>
                  <span style={{ color: '#999', fontSize: 12 }}>{formatBytes(f.size)}</span>
                  <span style={{ color: '#666', fontSize: 11 }}>{f.uploadedAt ? new Date(f.uploadedAt).toLocaleDateString() : ''}</span>
                </label>
              ))}
            </div>
          )}
        </>
      )}
    </AdminLayout>
  );
}

const styles = {
  scanBtn: { background: 'linear-gradient(135deg, #ff3f9d 0%, #ff5da8 35%, #9b35ff 100%)', border: 'none', color: '#fff', padding: '10px 20px', borderRadius: 8, cursor: 'pointer', fontWeight: 'bold' },
  secondaryBtn: { background: 'transparent', border: '1px solid #333', color: '#ccc', padding: '8px 16px', borderRadius: 8, cursor: 'pointer', fontSize: 13 },
  deleteBtn: { background: 'rgba(255,60,60,0.15)', border: '1px solid #ff5050', color: '#ff8080', padding: '8px 16px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 'bold' },
  error: { color: '#ff6b6b', background: 'rgba(90,20,20,0.3)', padding: 10, borderRadius: 8, marginBottom: 16, fontSize: 14 },
  success: { color: '#8f8', background: 'rgba(20,90,20,0.3)', padding: 10, borderRadius: 8, marginBottom: 16, fontSize: 14 },
  summaryRow: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10, marginBottom: 16 },
  summaryCard: { background: '#161625', border: '1px solid #2a2a3e', borderRadius: 10, padding: 14, textAlign: 'center' },
  summaryValue: { fontSize: 22, fontWeight: 800, color: '#fff' },
  summaryLabel: { fontSize: 11, color: '#999', marginTop: 4 },
  fileRow: { display: 'flex', alignItems: 'center', gap: 10, background: '#161625', border: '1px solid #2a2a3e', borderRadius: 8, padding: '8px 12px', cursor: 'pointer' }
};
