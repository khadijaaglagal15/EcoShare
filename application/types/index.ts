import { ViewStyle } from "react-native";

export type User = {
  id: string;
  fullname: string;
  email: string;
  profile_picture: string;
  gender: string;
  phone: string;
  rating: number;
  date_joined: string;
};
export interface ProductImage {
  startsWith(arg0: string): unknown;
  id: number;
  image: string;
  product: number;
}
export type Product = {
  id: string;
  title: string;
  description: string;
  price: number;
  images: ProductImage[];
  category: string;
  status: 'new' | 'like-new' | 'good' | 'used' ;
  location: string;
  posted_date: string;
  seller: string;
  sellerName: string;
  sellerAvatar: string;
  sold?:boolean;
  views: number;        
  discount?: number;     
  isFavorite: boolean;
  isFree?: boolean;
};
// export type Seller = {
//   id
// }

export type Category = {
  id:number;
  name: string;
};

export type Message = {
  id: string;
  sender: string;
  receiver: string;
  product: string | null;
  content: string;
  timestamp: string;
  is_read: boolean;
};

export type Conversation = {
  sender_id: string | number;
  receiver_id: string | number;
  receiver_fullname: string;
  receiver_avatar: string;
  sender_avatar: string;
  lastMessage: string;
  lastMessageTimestamp: string;
  unread?:boolean;
  unread_count: number;
  product?: {
    id?:number;
    image?: string;
    title?: string;
  }|null;
};

// Add these to your types file
export type CategoryItemProps = {
  category: Category;
  isSelected: boolean;
  onPress: (category: Category) => void;
  isFirst?: boolean;
  isLast?: boolean;
  style?: ViewStyle | ViewStyle[];
};

