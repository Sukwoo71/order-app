// In-memory 개발용 저장소 (초기 프로토타입)

export const menus = [
  {
    id: 'm-ice',
    name: '아메리카노(ICE)',
    description: '시원한 아이스 아메리카노',
    price: 4000,
    imageUrl: '/americano-ice.jpg',
    stock: 10,
    options: [
      { id: 'opt-shot', menuId: 'm-ice', name: '샷 추가', priceDelta: 500 },
      { id: 'opt-syrup', menuId: 'm-ice', name: '시럽 추가', priceDelta: 0 }
    ]
  },
  {
    id: 'm-hot',
    name: '아메리카노(HOT)',
    description: '따뜻한 아메리카노',
    price: 4000,
    imageUrl: '/americano-hot.jpg',
    stock: 10,
    options: [
      { id: 'opt-shot-2', menuId: 'm-hot', name: '샷 추가', priceDelta: 500 },
      { id: 'opt-syrup-2', menuId: 'm-hot', name: '시럽 추가', priceDelta: 0 }
    ]
  },
  {
    id: 'm-latte',
    name: '카페라떼',
    description: '부드러운 카페라떼',
    price: 5000,
    imageUrl: '/caffe-latte.jpg',
    stock: 10,
    options: [
      { id: 'opt-shot-3', menuId: 'm-latte', name: '샷 추가', priceDelta: 500 },
      { id: 'opt-syrup-3', menuId: 'm-latte', name: '시럽 추가', priceDelta: 0 }
    ]
  }
];

export const orders = [];

export const pushOrder = (order) => {
  orders.push(order);
  return order;
};

export const findOrder = (id) => orders.find((o) => o.id === id);


