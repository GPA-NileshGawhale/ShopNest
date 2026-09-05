import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Profile = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewDrafts, setReviewDrafts] = useState({});

  const submitReview = async (productId) => {
    const draft = reviewDrafts[productId] || {};
    if (!draft.rating) {
      alert('Please select a rating before submitting');
      return;
    }

    try {
      const token = user?.token;
      if (!token) {
        alert('Your session has expired. Please log in again.');
        logout();
        navigate('/login');
        return;
      }

      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          productId,
          rating: Number(draft.rating),
          comment: draft.comment || ''
        })
      });
      const data = await response.json();
      if (!response.ok) {
        if (response.status === 401) {
          logout();
          navigate('/login');
        }
        alert(data.message || 'Unable to submit review');
        return;
      }

      alert('Review submitted successfully');
      setReviewDrafts(current => ({ ...current, [productId]: { submitted: true } }));
    } catch (error) {
      console.error('Review submission failed:', error);
      alert('Unable to submit review. Please try again.');
    }
  };

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    const fetchMyOrders = async () => {
      try {
        const res = await fetch('/api/orders/myorders', {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        const data = await res.json();
        if (res.ok) {
          setOrders(Array.isArray(data) ? data : []);
        } else {
          // Token obsolete or 401: clear and bounce
          if (res.status === 401) {
             logout();
             navigate('/login');
          }
          setOrders([]);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchMyOrders();
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const containerStyle = { maxWidth: '1000px', margin: '40px auto', padding: '30px', background: '#18181b', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', color: '#fafafa' };
  const badgeStyle = { background: 'rgba(249,115,22,0.1)', color: '#f97316', padding: '6px 12px', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 'bold', display: 'inline-block' };

  if (!user) return null;

  return (
    <div style={containerStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '30px', marginBottom: '30px' }}>
        <div>
          <h2 style={{ color: '#fff', fontSize: '2.2rem', marginBottom: '10px' }}>My Profile</h2>
          <p style={{ color: '#a1a1aa', fontSize: '1.2rem', marginBottom: '5px' }}><strong>Name:</strong> {user.name}</p>
          <p style={{ color: '#a1a1aa', fontSize: '1.2rem', marginBottom: '15px' }}><strong>Email:</strong> {user.email}</p>
          <span style={badgeStyle}>Account Type: {user.role.toUpperCase()}</span>
        </div>
        <button onClick={handleLogout} className="btn" style={{ background: '#ef4444', boxShadow: 'none' }}>Logout</button>
      </div>

      <h3 style={{ color: '#f97316', marginBottom: '20px', fontSize: '1.5rem' }}>Order History</h3>
      {loading ? (
        <p style={{ color: '#a1a1aa' }}>Fetching your orders...</p>
      ) : orders.length === 0 ? (
        <div style={{ background: '#09090b', padding: '30px', borderRadius: '8px', textAlign: 'center', border: '1px solid #27272a' }}>
          <p style={{ color: '#a1a1aa', marginBottom: '15px' }}>You haven't placed any orders yet.</p>
          <Link to="/shop" className="btn">Start Shopping</Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '20px' }}>
          {orders.map(order => (
            <div key={order._id} style={{ background: '#09090b', padding: '20px', borderRadius: '12px', border: '1px solid #27272a', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '20px' }}>
              <div>
                <p style={{ color: '#a1a1aa', fontSize: '0.9rem', marginBottom: '5px' }}>Order ID: <span style={{ color: '#fff' }}>{order._id}</span></p>
                <p style={{ color: '#a1a1aa', fontSize: '0.9rem', marginBottom: '5px' }}>Placed On: <span style={{ color: '#fff' }}>{new Date(order.createdAt).toLocaleDateString()}</span></p>
                <p style={{ color: '#a1a1aa', fontSize: '0.9rem' }}>Total: <strong style={{ color: '#10b981' }}>₹{order.totalAmount.toFixed(2)}</strong></p>
              </div>
              <div>
                <span style={{ 
                  background: order.status === 'delivered' ? 'rgba(16,185,129,0.1)' : order.status === 'shipped' ? 'rgba(59,130,246,0.1)' : 'rgba(245,158,11,0.1)', 
                  color: order.status === 'delivered' ? '#10b981' : order.status === 'shipped' ? '#3b82f6' : '#f59e0b',
                  padding: '8px 16px', borderRadius: '20px', fontWeight: 'bold' 
                }}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
              </div>
              {order.status === 'delivered' && (
                <div style={{ width: '100%', borderTop: '1px solid #27272a', paddingTop: '15px' }}>
                  <strong style={{ color: '#fff' }}>Rate your delivered products</strong>
                  {order.items.map(item => {
                    const productId = item.productId?._id || item.productId;
                    const draft = reviewDrafts[productId] || {};
                    return (
                      <div key={productId} style={{ marginTop: '12px' }}>
                        <span style={{ color: '#a1a1aa' }}>{item.productId?.name || 'Product'}</span>
                        {draft.submitted ? (
                          <span style={{ color: '#10b981', marginLeft: '15px' }}>Review submitted</span>
                        ) : (
                          <>
                            <select value={draft.rating || ''} onChange={event => setReviewDrafts(current => ({ ...current, [productId]: { ...draft, rating: event.target.value } }))} style={{ marginLeft: '15px', padding: '6px', background: '#18181b', color: '#fff' }}>
                              <option value="">Rating</option>
                              {[1, 2, 3, 4, 5].map(value => <option key={value} value={value}>{value} star{value > 1 ? 's' : ''}</option>)}
                            </select>
                            <input placeholder="Optional comment" value={draft.comment || ''} onChange={event => setReviewDrafts(current => ({ ...current, [productId]: { ...draft, comment: event.target.value } }))} style={{ marginLeft: '10px', padding: '7px', maxWidth: '220px' }} />
                            <button type="button" className="btn" onClick={() => submitReview(productId)} style={{ marginLeft: '10px', padding: '7px 12px' }}>Submit</button>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Profile;