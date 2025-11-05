import { useState } from 'react';
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [cart, setCart] = useState([]);
  const [currentPage, setCurrentPage] = useState('order'); // 'order' 또는 'admin'

  // 관리자 페이지를 위한 더미 데이터
  const [dashboardSummary, setDashboardSummary] = useState({
    totalOrders: 1,
    pendingOrders: 1,
    inProgressOrders: 0,
    completedOrders: 0,
  });

  const [inventory, setInventory] = useState([
    { id: 1, name: '아메리카노 (ICE)', stock: 10 },
    { id: 2, name: '아메리카노 (HOT)', stock: 10 },
    { id: 3, name: '카페라떼', stock: 10 },
  ]);

  const [orders, setOrders] = useState([
    { id: 1, time: '7월 31일 13:00', menu: '아메리카노(ICE) x 1', amount: 4000, status: '주문 접수' },
  ]);

  const menuItems = [
    {
      id: 1,
      name: '아메리카노(ICE)',
      price: 4000,
      description: '시원한 아이스 아메리카노',
      options: [{ name: '샷 추가', price: 500 }, { name: '시럽 추가', price: 0 }],
      image: '/americano-ice.jpg' // 이미지 경로 업데이트
    },
    {
      id: 2,
      name: '아메리카노(HOT)',
      price: 4000,
      description: '따뜻한 아메리카노',
      options: [{ name: '샷 추가', price: 500 }, { name: '시럽 추가', price: 0 }],
      image: '/americano-hot.jpg' // 이미지 경로 업데이트
    },
    {
      id: 3,
      name: '카페라떼',
      price: 5000,
      description: '부드러운 카페라떼',
      options: [{ name: '샷 추가', price: 500 }, { name: '시럽 추가', price: 0 }],
      image: '/caffe-latte.jpg' // 이미지 경로 업데이트
    }
  ];

  const addToCart = (item, selectedOptions) => {
    let itemPrice = item.price;
    const optionsText = [];

    if (selectedOptions.shot) {
      itemPrice += 500;
      optionsText.push('샷 추가');
    }
    if (selectedOptions.syrup) {
      optionsText.push('시럽 추가');
    }

    const existingItemIndex = cart.findIndex(
      (cartItem) => cartItem.id === item.id && 
                    JSON.stringify(cartItem.selectedOptions) === JSON.stringify(selectedOptions)
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

  const placeOrder = () => {
    if (cart.length === 0) {
      alert('장바구니가 비어있습니다. 메뉴를 선택해주세요.');
      return;
    }

    const newOrder = {
      id: orders.length + 1,
      time: new Date().toLocaleString(),
      menu: cart.map(item => `${item.name}${item.optionsText.length > 0 ? `(${item.optionsText.join(', ')})` : ''} x ${item.quantity}`).join(', '),
      amount: calculateTotal(),
      status: '주문 접수',
    };

    setOrders(prevOrders => [...prevOrders, newOrder]);
    setDashboardSummary(prevSummary => ({
      ...prevSummary,
      totalOrders: prevSummary.totalOrders + 1,
      pendingOrders: prevSummary.pendingOrders + 1,
    }));

    // 재고 감소 로직 추가
    setInventory(prevInventory =>
      prevInventory.map(invItem => {
        const cartItem = cart.find(item => item.id === invItem.id);
        if (cartItem) {
          return { ...invItem, stock: Math.max(0, invItem.stock - cartItem.quantity) };
        }
        return invItem;
      })
    );

    setCart([]); // 장바구니 비우기
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

  const handleStockChange = (id, delta) => {
    setInventory((prevInventory) =>
      prevInventory.map((item) =>
        item.id === id ? { ...item, stock: Math.max(0, item.stock + delta) } : item
      )
    );
  };

  const handleOrderStatusChange = (id, manualComplete = false) => {
    setOrders((prevOrders) =>
      prevOrders.map((order) => {
        if (order.id === id && order.status === '주문 접수') {
          // '제조 시작' 버튼 클릭 시
          const orderQuantity = parseInt(order.menu.match(/x (\d+)/)?.[1] || 1);
          const completionTime = orderQuantity * 10 * 1000; // 1잔당 10초

          setTimeout(() => {
            setOrders(prevOrders => prevOrders.map(o => {
              // 이미 수동으로 완료된 경우 다시 변경하지 않도록 체크
              if (o.id === id && o.status === '제조 중') {
                setDashboardSummary(prevSummary => ({
                  ...prevSummary,
                  inProgressOrders: prevSummary.inProgressOrders - 1,
                  completedOrders: prevSummary.completedOrders + 1,
                }));
                return { ...o, status: '제조 완료' };
              }
              return o;
            }));
          }, completionTime);

          setDashboardSummary(prevSummary => ({
            ...prevSummary,
            pendingOrders: prevSummary.pendingOrders - 1,
            inProgressOrders: prevSummary.inProgressOrders + 1,
          }));
          return { ...order, status: '제조 중' };
        } else if (order.id === id && order.status === '제조 중' && manualComplete) {
          // '완료' 버튼 클릭 시 (수동 완료)
          setDashboardSummary(prevSummary => ({
            ...prevSummary,
            inProgressOrders: prevSummary.inProgressOrders - 1,
            completedOrders: prevSummary.completedOrders + 1,
          }));
          return { ...order, status: '제조 완료' };
        }
        return order;
      })
    );
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
            {menuItems.map((item) => (
              <div key={item.id} className="menu-item-card">
                <img src={item.image} alt={item.name} className="item-image" /> {/* 이미지 태그 추가 */}
                <h3>{item.name}</h3>
                <p>{item.price.toLocaleString()}원</p>
                <p className="item-description">{item.description}</p>
                <div className="options">
                  {item.options.map((option, index) => (
                    <label key={index}>
                      <input type="checkbox" name={option.name} /> {option.name} ({option.price >= 0 ? '+' : ''}{option.price.toLocaleString()}원)
                    </label>
                  ))}
                </div>
                <button className="add-to-cart-button" onClick={() => {
                  const selectedOptions = {
                    shot: document.querySelector(`[name="샷 추가"]`).checked,
                    syrup: document.querySelector(`[name="시럽 추가"]`).checked,
                  };
                  addToCart(item, selectedOptions);
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
              {inventory.map((item) => (
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
                    <span>{order.time}</span>
                    <span>{order.menu}</span>
                    <span>{order.amount.toLocaleString()}원</span>
                    {order.status === '주문 접수' ? (
                      <button className="order-action-button" onClick={() => handleOrderStatusChange(order.id)}>
                        제조 시작
                      </button>
                    ) : order.status === '제조 중' ? (
                      <div className="in-progress-display">
                        <span className="progress-bar">제조 중</span>
                        <button className="order-action-button complete small" onClick={() => handleOrderStatusChange(order.id, true)}>
                          완료
                        </button>
                      </div>
                    ) : (
                      <span className={`order-status completed-button`}>
                        {order.status}
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
