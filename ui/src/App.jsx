import { useEffect, useMemo, useState } from 'react';
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [cart, setCart] = useState([]);
  const [currentPage, setCurrentPage] = useState('order'); // 'order' 또는 'admin'

  // 백엔드 연동 상태
  const [menus, setMenus] = useState([]);
  const [orders, setOrders] = useState([]);

  const dashboardSummary = useMemo(() => {
    const total = orders.length;
    const pending = orders.filter(o => o.status === 'PENDING').length;
    const inProgress = orders.filter(o => o.status === 'IN_PROGRESS').length;
    const completed = orders.filter(o => o.status === 'COMPLETED').length;
    return { totalOrders: total, pendingOrders: pending, inProgressOrders: inProgress, completedOrders: completed };
  }, [orders]);

  const API = (path) => {
    const base = (import.meta?.env?.VITE_API_BASE) || 'http://localhost:4000/api';
    return `${base}${path}`;
  };

  async function fetchMenus() {
    const res = await fetch(API('/menus?includeOptions=true'));
    const json = await res.json();
    setMenus(json.data || []);
  }
  async function fetchOrders() {
    const res = await fetch(API('/orders'));
    const json = await res.json();
    setOrders(json.data || []);
  }

  useEffect(() => {
    fetchMenus();
    fetchOrders();
  }, []);

  // 관리자 화면에서 주문 목록 자동 새로고침 (5초마다)
  useEffect(() => {
    if (currentPage === 'admin') {
      const interval = setInterval(() => {
        fetchOrders();
        fetchMenus();
      }, 5000);
      return () => clearInterval(interval);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  const addToCart = (item, selectedOptionIds) => {
    let itemPrice = item.price;
    const optionsText = [];
    const selectedOptions = [];

    (item.options || []).forEach(opt => {
      if (selectedOptionIds.includes(opt.id)) {
        itemPrice += (opt.priceDelta || 0);
        optionsText.push(opt.name);
        selectedOptions.push({ optionId: opt.id });
      }
    });

    const existingItemIndex = cart.findIndex(
      (cartItem) => cartItem.id === item.id && 
                    JSON.stringify(cartItem.selectedOptions.map(o => o.optionId).sort()) === JSON.stringify(selectedOptionIds.sort())
    );

    if (existingItemIndex > -1) {
      const newCart = [...cart];
      newCart[existingItemIndex].quantity += 1;
      setCart(newCart);
    } else {
      setCart([...cart, { ...item, quantity: 1, itemPrice, selectedOptions, optionsText }]);
    }
  };

  const updateQuantity = (index, delta) => {
    const newCart = [...cart];
    newCart[index].quantity += delta;

    if (newCart[index].quantity <= 0) {
      newCart.splice(index, 1); // 수량이 0 이하면 항목 제거
    }
    setCart(newCart);
  };

  const placeOrder = async () => {
    if (cart.length === 0) {
      alert('장바구니가 비어있습니다. 메뉴를 선택해주세요.');
      return;
    }
    const payload = {
      items: cart.map(it => ({ menuId: it.id, quantity: it.quantity, options: it.selectedOptions || [] }))
    };
    const res = await fetch(API('/orders'), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    const json = await res.json();
    if (!res.ok) {
      alert(json?.error?.message || '주문에 실패했습니다');
      return;
    }
    setCart([]);
    await fetchMenus();
    await fetchOrders();
    alert('주문이 완료되었습니다!');
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.itemPrice * item.quantity), 0);
  };

  const getStockStatus = (stock) => {
    if (stock === 0) return '품절';
    if (stock < 5) return '주의';
    return '정상';
  };

  const handleStockChange = async (id, delta) => {
    await fetch(API(`/menus/${id}/stock`), { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ delta }) });
    fetchMenus();
  };

  const handleOrderStatusChange = async (id, manualComplete = false) => {
    const order = orders.find(o => o.id === id);
    if (!order) return;
    const sumQty = (order.items || []).reduce((s, it) => s + (it.quantity || 0), 0) || 1;
    if (order.status === 'PENDING') {
      await fetch(API(`/orders/${id}/status`), { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'IN_PROGRESS' }) });
      fetchOrders();
      setTimeout(async () => {
        const latestRes = await fetch(API(`/orders/${id}`));
        const latest = (await latestRes.json()).data;
        if (latest?.status === 'IN_PROGRESS') {
          await fetch(API(`/orders/${id}/status`), { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'COMPLETED' }) });
          fetchOrders();
        }
      }, sumQty * 10000);
      return;
    }
    if (order.status === 'IN_PROGRESS' && manualComplete) {
      await fetch(API(`/orders/${id}/status`), { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'COMPLETED' }) });
      fetchOrders();
    }
  };

  return (
    <div className="App">
      <header className="header">
        <div className="logo">COZY</div>
        <nav className="nav">
          <button 
            className={`nav-button ${currentPage === 'order' ? 'active' : ''}`}
            onClick={() => setCurrentPage('order')}
          >
            주문하기
          </button>
          <button
            className={`nav-button ${currentPage === 'admin' ? 'active' : ''}`}
            onClick={() => setCurrentPage('admin')}
          >
            관리자
          </button>
        </nav>
      </header>

      {currentPage === 'order' ? (
        <main className="main-content">
          <section className="menu-list">
            {menus.map((item) => (
              <div key={item.id} className="menu-item-card">
                <img src={item.imageUrl || item.image} alt={item.name} className="item-image" /> {/* 이미지 태그 추가 */}
                <h3>{item.name}</h3>
                <p>{item.price.toLocaleString()}원</p>
                <p className="item-description">{item.description}</p>
                <div className="options">
                  {(item.options || []).map((option, index) => (
                    <label key={option.id || index}>
                      <input type="checkbox" id={`${item.id}-${option.id}`} /> {option.name} ({(option.priceDelta || 0) >= 0 ? '+' : ''}{Number(option.priceDelta || 0).toLocaleString()}원)
                    </label>
                  ))}
                </div>
                <button className="add-to-cart-button" onClick={() => {
                  const selectedOptionIds = (item.options || [])
                    .filter(opt => {
                      const checkbox = document.getElementById(`${item.id}-${opt.id}`);
                      return checkbox?.checked;
                    })
                    .map(opt => opt.id);
                  addToCart(item, selectedOptionIds);
                }}>
                  담기
                </button>
              </div>
            ))}
          </section>

          <section className="cart">
            <h2>장바구니</h2>
            <div className="cart-container"> {/* New wrapper for flex layout */}
              <div className="cart-details"> {/* Left side: Order details */}
                {cart.length === 0 ? (
                  <p>장바구니가 비어있습니다.</p>
                ) : (
                  cart.map((item, index) => (
                    <div key={index} className="cart-item">
                      <span>
                        {item.name} {item.optionsText.length > 0 ? `(${item.optionsText.join(', ')})` : ''}
                      </span>
                      <div className="cart-item-controls">
                        <button onClick={() => updateQuantity(index, -1)}>-</button>
                        <span>{item.quantity}</span>
                        <button onClick={() => updateQuantity(index, 1)}>+</button>
                      </div>
                      <span>{item.itemPrice.toLocaleString()}원</span>
                    </div>
                  ))
                )}
              </div>
              <div className="cart-summary"> {/* Right side: Total amount and button */}
                <div className="cart-total">
                  총 금액 <span>{calculateTotal().toLocaleString()}원</span>
                </div>
                <button className="order-button" onClick={placeOrder}>주문하기</button>
              </div>
            </div>
          </section>
        </main>
      ) : (
        <main className="admin-content">
          <section className="admin-dashboard-summary">
            <h2>관리자 대시보드</h2>
            <div className="summary-items">
              <div className="summary-item">총 주문 {dashboardSummary.totalOrders}</div>
              <div className="summary-item">주문 접수 {dashboardSummary.pendingOrders}</div>
              <div className="summary-item">제조 중 {dashboardSummary.inProgressOrders}</div>
              <div className="summary-item">제조 완료 {dashboardSummary.completedOrders}</div>
            </div>
          </section>

          <section className="admin-inventory">
            <h2>재고 현황</h2>
            <div className="inventory-items">
              {menus.map((item) => (
                <div key={item.id} className="inventory-item-card">
                  <h3>{item.name}</h3>
                  <p>
                    {item.stock}개 
                    <span className={`stock-status ${getStockStatus(item.stock)}`}>
                      ({getStockStatus(item.stock)})
                    </span>
                  </p>
                  <div className="inventory-controls">
                    <button onClick={() => handleStockChange(item.id, -1)}>-</button>
                    <button onClick={() => handleStockChange(item.id, 1)}>+</button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="admin-orders">
            <h2>주문 현황</h2>
            <div className="order-list">
              {orders.length === 0 ? (
                <p>접수된 주문이 없습니다.</p>
              ) : (
                orders.map((order) => (
                  <div key={order.id} className="order-item">
                    <span>{new Date(order.orderedAt || order.time).toLocaleString()}</span>
                    <span>{(order.items || []).map(i => `${i.menuName || i.menuId} x ${i.quantity}`).join(', ')}</span>
                    <span>{(order.totalAmount || order.amount || 0).toLocaleString()}원</span>
                    {order.status === 'PENDING' ? (
                      <button className="order-action-button" onClick={() => handleOrderStatusChange(order.id)}>
                        제조 시작
                      </button>
                    ) : order.status === 'IN_PROGRESS' ? (
                      <div className="in-progress-display">
                        <span className="progress-bar">제조 중</span>
                        <button className="order-action-button complete small" onClick={() => handleOrderStatusChange(order.id, true)}>
                          완료
                        </button>
                      </div>
                    ) : (
                      <span className={`order-status completed-button`}>
                        제조 완료
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>
          </section>
        </main>
      )}
    </div>
  );
}

export default App;
