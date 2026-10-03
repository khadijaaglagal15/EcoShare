import { Product, User, Category, Conversation, Message } from '../types';


export const mockProducts: Product[] = [
  {
    id: '1',
    title: 'iPhone 13 Pro - Like New',
    description: 'iPhone 13 Pro 256GB in excellent condition. Includes original box, charger, and protective case. Battery health at 92%. Minor scratches on the back.',
    price: 500,
    images: [
      'https://images-cdn.ubuy.ma/635059f52b737a04a6465e86-apple-iphone-13-pro-max-128gb-gold.jpg',
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSgCgTE8aKFGO4CSDQ3YlzSeE4dpZ4ZFlVanoTo-aL8fU36bohrV8W8Satq50Lp88zlwro&usqp=CAU'
    ],
    category: 'Electronics',
    condition: 'like-new',
    location: 'Paris',
    postedDate: '2023-09-15T14:30:00Z',
    sellerId: '2',
    sellerName: 'Sophie Martin',
    sellerAvatar: 'https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg',
    isFavorite: true,
    views: 0
  },
  {
    id: '2',
    title: 'Leather Sofa - Vintage Brown',
    description: 'Beautiful vintage leather sofa in brown. 3-seater with comfortable cushions. Some wear on the armrests, but overall in good condition. Dimensions: 220x85x75 cm.',
    price: 450,
    images: [
      'https://craftersandweavers.com/cdn/shop/files/1_d2e09e20-3419-49f6-a881-576026523f75.png?v=1722461581',
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQI7rvCUysBGuAifOYrgIQrJTbazdGrVkRyNBAGw4GaV6kP2q3uLIMuoZIkCywdV2RZs6I&usqp=CAU'
    ],
    category: 'Furniture',
    condition: 'good',
    location: 'Lyon',
    postedDate: '2023-09-10T09:15:00Z',
    sellerId: '3',
    sellerName: 'Thomas Dubois',
    sellerAvatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg',
    isFavorite: false,
    views: 0
  },
  {
    id: '3',
    title: 'Mountain Bike - Trek Marlin 7',
    description: 'Trek Marlin 7 mountain bike, 2022 model. Size M. Used for one season, excellent condition. 29-inch wheels, hydraulic disc brakes. Includes bottle holder and bike stand.',
    price: 680,
    images: [
      'https://www.canyon.com/dw/image/v2/BCML_PRD/on/demandware.static/-/Sites-canyon-master/default/dw440cf101/images/3rd-variation-attribute-images/3640/full_2024_3640_spectral-cf-8-cllctv-mullet_M179_P03_P5.jpg?sw=501&sh=282&sm=fit&sfrm=png&q=90&bgcolor=F2F2F2',
      'https://images.pexels.com/photos/100582/pexels-photo-100582.jpeg'
    ],
    category: 'Sports',
    condition: 'like-new',
    location: 'Bordeaux',
    postedDate: '2023-09-05T16:45:00Z',
    sellerId: '4',
    sellerName: 'Émilie Bernard',
    sellerAvatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg',
    isFavorite: true,
    views: 0
  },
  {
    id: '4',
    title: 'Vintage Vinyl Records Collection',
    description: 'Collection of 25 vinyl records from the 70s and 80s. Includes classics from Pink Floyd, Led Zeppelin, and The Rolling Stones. Most are in good condition with original covers.',
    price: 220,
    images: [
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTAb2RflGblLXK3HjkHKPZVOIq6-zVZudhfMw&s',
      'https://images.pexels.com/photos/3552948/pexels-photo-3552948.jpeg'
    ],
    category: 'Electronics',
    condition: 'good',
    location: 'Marseille',
    postedDate: '2023-09-01T11:30:00Z',
    sellerId: '5',
    sellerName: 'Lucas Moreau',
    sellerAvatar: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg',
    isFavorite: false,
    views: 0
  },
  {
    id: '5',
    title: 'Designer Handbag - Louis Vuitton',
    description: 'Authentic Louis Vuitton Neverfull MM in Damier Ebene. Purchased in 2021, used occasionally. Comes with dust bag and original receipt. Minor wear on the corners.',
    price: 850,
    images: [
      'https://images.pexels.com/photos/904350/pexels-photo-904350.jpeg',
      'https://images.pexels.com/photos/904350/pexels-photo-904350.jpeg'
    ],
    category: 'Clothing',
    condition: 'good',
    location: 'Nice',
    postedDate: '2023-08-25T13:20:00Z',
    sellerId: '6',
    sellerName: 'Chloé Petit',
    sellerAvatar: 'https://images.pexels.com/photos/1542085/pexels-photo-1542085.jpeg',
    isFavorite: true,
    views: 0
  },
  {
    id: '6',
    title: 'Gaming PC - Custom Built',
    description: 'Custom-built gaming PC with Ryzen 7 5800X, RTX 3070, 32GB RAM, 1TB NVMe SSD. Built in 2022, used for gaming only. All original boxes for components included.',
    price: 1200,
    images: [
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSpP0YaIngqV_49xhRXyEeeE1_fMICBhEh8aQ&s',
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSZokLBWbMRLd-uZLpdDMr0kClFPBuNhqpXkvcYcUDsKNTuBwLKroOZ7AciXNVIsfUd77I&usqp=CAU'
    ],
    category: 'Electronics',
    condition: 'like-new',
    location: 'Toulouse',
    postedDate: '2023-08-20T10:10:00Z',
    sellerId: '7',
    sellerName: 'Antoine Leroy',
    sellerAvatar: 'https://images.pexels.com/photos/1121796/pexels-photo-1121796.jpeg',
    isFavorite: false,
    views: 0
  }
];

export const mockUser: User = {
  id: '1',
  name: 'Jean Dupont',
  email: 'jean.dupont@example.com',
  avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg',
  joinedDate: '2022-05-10T00:00:00Z',
  rating: 4.8,
};

export const mockConversations: Conversation[] = [
  {
    id: '1',
    participantId: '2',
    participantName: 'Sophie Martin',
    participantAvatar: 'https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg',
    lastMessage: 'Is the iPhone still available?',
    lastMessageTimestamp: '2023-09-16T18:30:00Z',
    unreadCount: 2,
    productId: '1',
    productTitle: 'iPhone 13 Pro - Like New',
    productImage: 'https://images.pexels.com/photos/5747205/pexels-photo-5747205.jpeg',
  },
  {
    id: '2',
    participantId: '3',
    participantName: 'Thomas Dubois',
    participantAvatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg',
    lastMessage: 'Can you do 400€ for the sofa?',
    lastMessageTimestamp: '2023-09-15T14:45:00Z',
    unreadCount: 0,
    productId: '2',
    productTitle: 'Leather Sofa - Vintage Brown',
    productImage: 'https://images.pexels.com/photos/1866149/pexels-photo-1866149.jpeg',
  },
  {
    id: '3',
    participantId: '5',
    participantName: 'Lucas Moreau',
    participantAvatar: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg',
    lastMessage: 'Do you have any Pink Floyd albums in the collection?',
    lastMessageTimestamp: '2023-09-14T09:20:00Z',
    unreadCount: 1,
    productId: '4',
    productTitle: 'Vintage Vinyl Records Collection',
    productImage: 'https://images.pexels.com/photos/1374557/pexels-photo-1374557.jpeg',
  }
];

export const mockMessages: Record<string, Message[]> = {
  '1': [
    {
      id: '1-1',
      senderId: '2',
      receiverId: '1',
      productId: '1',
      productTitle: 'iPhone 13 Pro - Like New',
      productImage: 'https://images.pexels.com/photos/5747205/pexels-photo-5747205.jpeg',
      content: 'Hi there! Is the iPhone still available?',
      timestamp: '2023-09-16T18:30:00Z',
      isRead: false,
    },
    {
      id: '1-2',
      senderId: '1',
      receiverId: '2',
      productId: '1',
      productTitle: 'iPhone 13 Pro - Like New',
      productImage: 'https://images.pexels.com/photos/5747205/pexels-photo-5747205.jpeg',
      content: 'Yes, it is! Are you interested?',
      timestamp: '2023-09-16T18:45:00Z',
      isRead: true,
    },
    {
      id: '1-3',
      senderId: '2',
      receiverId: '1',
      productId: '1',
      productTitle: 'iPhone 13 Pro - Like New',
      productImage: 'https://images.pexels.com/photos/5747205/pexels-photo-5747205.jpeg',
      content: 'Definitely! Would you accept 650€ for it?',
      timestamp: '2023-09-16T19:00:00Z',
      isRead: false,
    },
  ],
  '2': [
    {
      id: '2-1',
      senderId: '1',
      receiverId: '3',
      productId: '2',
      productTitle: 'Leather Sofa - Vintage Brown',
      productImage: 'https://images.pexels.com/photos/1866149/pexels-photo-1866149.jpeg',
      content: 'Hello! I\'m interested in your leather sofa. Is it still available?',
      timestamp: '2023-09-15T14:30:00Z',
      isRead: true,
    },
    {
      id: '2-2',
      senderId: '3',
      receiverId: '1',
      productId: '2',
      productTitle: 'Leather Sofa - Vintage Brown',
      productImage: 'https://images.pexels.com/photos/1866149/pexels-photo-1866149.jpeg',
      content: 'Hi there! Yes, it\'s still available. When would you like to see it?',
      timestamp: '2023-09-15T14:40:00Z',
      isRead: true,
    },
    {
      id: '2-3',
      senderId: '1',
      receiverId: '3',
      productId: '2',
      productTitle: 'Leather Sofa - Vintage Brown',
      productImage: 'https://images.pexels.com/photos/1866149/pexels-photo-1866149.jpeg',
      content: 'Great! Can you do 400€ for the sofa?',
      timestamp: '2023-09-15T14:45:00Z',
      isRead: true,
    },
  ],
  '3': [
    {
      id: '3-1',
      senderId: '1',
      receiverId: '5',
      productId: '4',
      productTitle: 'Vintage Vinyl Records Collection',
      productImage: 'https://images.pexels.com/photos/1374557/pexels-photo-1374557.jpeg',
      content: 'Hi! I\'m a big fan of vinyl records. Do you have any Pink Floyd albums in the collection?',
      timestamp: '2023-09-14T09:15:00Z',
      isRead: true,
    },
    {
      id: '3-2',
      senderId: '5',
      receiverId: '1',
      productId: '4',
      productTitle: 'Vintage Vinyl Records Collection',
      productImage: 'https://images.pexels.com/photos/1374557/pexels-photo-1374557.jpeg',
      content: 'Hello! Yes, I have Dark Side of the Moon and The Wall in great condition.',
      timestamp: '2023-09-14T09:20:00Z',
      isRead: false,
    },
  ],
};

