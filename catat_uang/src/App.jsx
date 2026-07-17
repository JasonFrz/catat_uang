import { useState, useEffect } from 'react';
import './index.css'; // We will use one unified CSS file

function App() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    nama_barang: '',
    harga: '',
    qty: ''
  });

  const [editingId, setEditingId] = useState(null);

  const fetchItems = async () => {
    try {
      const response = await fetch('/api/items');
      const data = await response.json();
      setItems(data);
    } catch (error) {
      console.error('Error fetching items:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleEdit = (item) => {
    setForm({
      nama_barang: item.nama_barang,
      harga: item.harga,
      qty: item.qty
    });
    setEditingId(item.id);
  };

  const cancelEdit = () => {
    setForm({ nama_barang: '', harga: '', qty: '' });
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nama_barang || !form.harga || !form.qty) return;

    try {
      const url = editingId ? `/api/items/${editingId}` : '/api/items';
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          nama_barang: form.nama_barang,
          harga: parseFloat(form.harga),
          qty: parseInt(form.qty, 10)
        })
      });
      
      if (response.ok) {
        setForm({ nama_barang: '', harga: '', qty: '' });
        setEditingId(null);
        fetchItems(); // Refresh list
      }
    } catch (error) {
      console.error('Error saving item:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`/api/items/${id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        fetchItems();
      }
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  // Calculate grand total
  const grandTotal = items.reduce((sum, item) => sum + parseFloat(item.total), 0);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };

  return (
    <div className="app-container">
      <div className="glass-panel">
        <header>
          <h1>Catat Uang</h1>
          <p>Expense & Item Tracker</p>
        </header>

        <section className="form-section">
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label>Nama Barang</label>
              <input 
                type="text" 
                name="nama_barang" 
                value={form.nama_barang} 
                onChange={handleChange} 
                placeholder="Contoh: Kopi"
                required
              />
            </div>
            <div className="input-group">
              <label>Harga (Rp)</label>
              <input 
                type="number" 
                name="harga" 
                value={form.harga} 
                onChange={handleChange} 
                placeholder="0"
                min="0"
                required
              />
            </div>
            <div className="input-group">
              <label>Qty</label>
              <input 
                type="number" 
                name="qty" 
                value={form.qty} 
                onChange={handleChange} 
                placeholder="1"
                min="1"
                required
              />
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-add">
                <span>{editingId ? 'Update' : 'Tambah'}</span>
              </button>
              {editingId && (
                <button type="button" onClick={cancelEdit} className="btn-cancel">
                  <span>Batal</span>
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="list-section">
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Barang</th>
                  <th>Harga</th>
                  <th>Tanggal</th>
                  <th>Qty</th>
                  <th>Total</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="text-center">Loading...</td>
                  </tr>
                ) : items.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center text-muted">Belum ada data.</td>
                  </tr>
                ) : (
                  items.map(item => (
                    <tr key={item.id}>
                      <td>{item.nama_barang}</td>
                      <td>{formatCurrency(item.harga)}</td>
                      <td>{formatDate(item.created_at)}</td>
                      <td>{item.qty}</td>
                      <td className="font-bold">{formatCurrency(item.total)}</td>
                      <td>
                        <div className="action-buttons">
                          <button onClick={() => handleEdit(item)} className="btn-edit">
                            Edit
                          </button>
                          <button onClick={() => handleDelete(item.id)} className="btn-delete">
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          <div className="grand-total">
            <h3>Total Pengeluaran:</h3>
            <h2 className="gradient-text">{formatCurrency(grandTotal)}</h2>
          </div>
        </section>
      </div>
    </div>
  );
}

export default App;
