import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API = 'http://localhost:5004';

const s = {
  page: { minHeight: '100vh', background: '#fafaf8', fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif', color: '#1a1a1a' },
  nav: { background: '#fff', borderBottom: '1px solid #e8e8e4', padding: '0 1.5rem', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10 },
  logo: { fontSize: 20, fontWeight: 700, color: '#8b5cf6' },
  btn: (bg='#8b5cf6') => ({ background: bg, color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }),
  content: { maxWidth: 1100, margin: '0 auto', padding: '2rem 1.5rem' },
  grid: { columns: '3 280px', columnGap: 16 },
  card: { background: '#fff', borderRadius: 12, border: '1px solid #e8e8e4', marginBottom: 16, breakInside: 'avoid', overflow: 'hidden' },
  cardImg: { width: '100%', display: 'block' },
  cardBody: { padding: '12px 14px' },
  tag: { display: 'inline-block', background: '#f3f0ff', color: '#7c3aed', fontSize: 11, padding: '2px 8px', borderRadius: 20, marginRight: 4, marginBottom: 4 },
  modal: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 },
  modalBox: { background: '#fff', borderRadius: 16, padding: '2rem', width: 460, maxHeight: '90vh', overflowY: 'auto' },
  input: { width: '100%', padding: '9px 12px', border: '1px solid #e8e8e4', borderRadius: 8, fontSize: 14, marginBottom: 12, outline: 'none', boxSizing: 'border-box' },
  boardCard: { background: '#fff', border: '1px solid #e8e8e4', borderRadius: 12, padding: '1.25rem', cursor: 'pointer', transition: 'border-color 0.15s' },
  boardGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 16, marginTop: 20 },
  del: { background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer', fontSize: 18, padding: '2px 6px', float: 'right' }
};

export default function App() {
  const [view, setView] = useState('boards');
  const [boards, setBoards] = useState([]);
  const [board, setBoard] = useState(null);
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [showNewBoard, setShowNewBoard] = useState(false);
  const [newBoard, setNewBoard] = useState({ title: '', description: '' });
  const [form, setForm] = useState({ type: 'image', content: '', url: '', note: '', tags: '' });
  const [file, setFile] = useState(null);

  useEffect(() => { axios.get('/api/boards').then(r => setBoards(r.data)); }, []);

  const openBoard = async (id) => {
    const { data } = await axios.get(`/api/boards/${id}`);
    setBoard(data); setView('board');
  };

  const createBoard = async (e) => {
    e.preventDefault();
    const { data } = await axios.post('/api/boards', newBoard);
    setBoards([data, ...boards]);
    setNewBoard({ title: '', description: '' }); setShowNewBoard(false);
  };

  const addItem = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append('board_id', board.id);
    fd.append('type', form.type);
    if (form.content) fd.append('content', form.content);
    if (form.url) fd.append('url', form.url);
    if (form.note) fd.append('note', form.note);
    if (form.tags) fd.append('tags', form.tags);
    if (file) fd.append('image', file);
    await axios.post('/api/items', fd);
    const { data } = await axios.get(`/api/boards/${board.id}`);
    setBoard(data);
    setForm({ type: 'image', content: '', url: '', note: '', tags: '' }); setFile(null); setShowAdd(false);
  };

  const deleteItem = async (itemId) => {
    await axios.delete(`/api/items/${itemId}`);
    setBoard({ ...board, items: board.items.filter(i => i.id !== itemId) });
  };

  const filtered = board?.items.filter(i => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (i.note||'').toLowerCase().includes(q) || i.tags.some(t => t.toLowerCase().includes(q)) || (i.content||'').toLowerCase().includes(q);
  }) || [];

  if (view === 'boards') return (
    <div style={s.page}>
      <nav style={s.nav}>
        <span style={s.logo}>MoodBoard</span>
        <button style={s.btn()} onClick={() => setShowNewBoard(true)}>+ New Board</button>
      </nav>
      <div style={s.content}>
        <h2 style={{ fontSize: 22, fontWeight: 700 }}>Your Boards</h2>
        <div style={s.boardGrid}>
          {boards.map(b => (
            <div key={b.id} style={s.boardCard} onClick={() => openBoard(b.id)}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: '#f3f0ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, marginBottom: 10 }}>🎨</div>
              <p style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>{b.title}</p>
              {b.description && <p style={{ fontSize: 13, color: '#94a3b8' }}>{b.description}</p>}
            </div>
          ))}
          <div style={{ ...s.boardCard, border: '2px dashed #e8e8e4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: 14, minHeight: 100 }} onClick={() => setShowNewBoard(true)}>
            + Create board
          </div>
        </div>
      </div>
      {showNewBoard && (
        <div style={s.modal} onClick={() => setShowNewBoard(false)}>
          <div style={s.modalBox} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 20 }}>New Board</h3>
            <form onSubmit={createBoard}>
              <input style={s.input} placeholder="Board title" value={newBoard.title} onChange={e => setNewBoard({ ...newBoard, title: e.target.value })} required />
              <input style={s.input} placeholder="Description (optional)" value={newBoard.description} onChange={e => setNewBoard({ ...newBoard, description: e.target.value })} />
              <div style={{ display: 'flex', gap: 10 }}>
                <button style={s.btn()} type="submit">Create</button>
                <button style={{ ...s.btn('#e2e8f0'), color: '#64748b' }} type="button" onClick={() => setShowNewBoard(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div style={s.page}>
      <nav style={s.nav}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#64748b' }} onClick={() => setView('boards')}>←</button>
          <span style={s.logo}>{board?.title}</span>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <input style={{ ...s.input, width: 200, marginBottom: 0 }} placeholder="Search tags, notes..." value={search} onChange={e => setSearch(e.target.value)} />
          <button style={s.btn()} onClick={() => setShowAdd(true)}>+ Add Item</button>
        </div>
      </nav>
      <div style={s.content}>
        <div style={s.grid}>
          {filtered.map(item => (
            <div key={item.id} style={s.card}>
              {item.file_path && <img src={`${API}${item.file_path}`} alt="" style={s.cardImg} />}
              {item.type === 'link' && item.url && (
                <div style={{ padding: '12px 14px', background: '#f8fafc' }}>
                  <a href={item.url} target="_blank" rel="noopener noreferrer" style={{ color: '#8b5cf6', fontSize: 13, wordBreak: 'break-all' }}>{item.url}</a>
                </div>
              )}
              {item.type === 'note' && item.content && (
                <div style={{ padding: '16px 14px', fontSize: 14, lineHeight: 1.6, color: '#374151' }}>{item.content}</div>
              )}
              <div style={s.cardBody}>
                {item.note && <p style={{ fontSize: 13, color: '#64748b', marginBottom: 8 }}>{item.note}</p>}
                <div>
                  {item.tags.map(t => <span key={t} style={s.tag}>#{t}</span>)}
                </div>
                <button style={s.del} onClick={() => deleteItem(item.id)}>×</button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <p style={{ color: '#94a3b8', fontSize: 14 }}>No items yet. Add your first image, link or note!</p>
          )}
        </div>
      </div>
      {showAdd && (
        <div style={s.modal} onClick={() => setShowAdd(false)}>
          <div style={s.modalBox} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 20 }}>Add Item</h3>
            <form onSubmit={addItem}>
              <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} style={{ ...s.input }}>
                <option value="image">Image upload</option>
                <option value="link">Link / URL</option>
                <option value="note">Note / Text</option>
              </select>
              {form.type === 'image' && <input type="file" accept="image/*" onChange={e => setFile(e.target.files[0])} style={{ ...s.input }} />}
              {form.type === 'link' && <input style={s.input} placeholder="https://..." value={form.url} onChange={e => setForm({ ...form, url: e.target.value })} />}
              {form.type === 'note' && <textarea style={{ ...s.input, height: 100, resize: 'vertical' }} placeholder="Your note..." value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} />}
              <input style={s.input} placeholder="Tags (comma separated: design, color, idea)" value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} />
              <input style={s.input} placeholder="Note (optional)" value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} />
              <div style={{ display: 'flex', gap: 10 }}>
                <button style={s.btn()} type="submit">Add</button>
                <button style={{ ...s.btn('#e2e8f0'), color: '#64748b' }} type="button" onClick={() => setShowAdd(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
