import { useState } from 'react';
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [cart, setCart] = useState([]);

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

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.itemPrice * item.quantity), 0);
  };

  return (
    <div className="App">
      <header className="header">
        <div className="logo">COZY</div>
        <nav className="nav">
          <button className="nav-button active">주문하기</button>
          <button className="nav-button">관리자</button>
        </nav>
      </header>

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
              <button className="order-button">주문하기</button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
