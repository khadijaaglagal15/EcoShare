import React, { createContext, useContext, useState, ReactNode , useEffect} from 'react';
import { Product, User, Conversation } from '@/types';
import api from '../app/api';

type AppContextType = {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  profile: User;
  setProfile: React.Dispatch<React.SetStateAction<User>>;
  isAuthenticated: boolean;
  authToken: string | null;
  favoriteProducts: string[];
  userProducts: Product[];
  setUserProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  login: (token: string) => void;
  logout: () => void;
  toggleFavorite: (productId: string) => Promise <void>;
  getProductById: (id: string) => Promise<Product | undefined>;
  conversations: Conversation[]; 
  fetchConversations: () => Promise<void>;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [favoriteProducts, setFavoriteProducts] = useState<string[]>([])
  const [userProducts, setUserProducts] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);

  const isAuthenticated = !!user;

  const login = async (token: string) => {
    setAuthToken(token);
    try {
      const response = await api.get('/profile/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(response.data); // ← utilise les vraies infos du backend
      setProfile(response.data);
    } catch (e) {
      setUser(null);
      setProfile(null);
    }
  };

  const logout = () => {
    setUser(null);
    setAuthToken(null);
  };

const fetchUserProfile = async () => {
  try {
    const response = await api.get('/profile/'); // adapte l'URL si besoin
    setProfile(response.data);
  } catch (error) {
    // Gère l'erreur si besoin
    setProfile(null);
  }
};

const fetchUserProducts = async () => {
  try {
    const res = await api.get('/user-products/');
    setUserProducts(res.data);
  } catch (e) {
    setUserProducts([]);
  }
};

const fetchFavorites = async () => {
  try {
    const res = await api.get('/user-favorites/');
    const ids = res.data.map((item: { product: number }) => item.product.toString());
    const uniqueIds = Array.from(new Set(ids)) as string[];
    setFavoriteProducts(uniqueIds);
  } catch (e) {
    setFavoriteProducts([]);
  }
};

const fetchConversations = async () => {
  try {
    const res = await api.get('/conversations/'); // adapte l'URL à ton backend
    setConversations(res.data);
  } catch (e) {
    setConversations([]);
  }
};

useEffect(() => {
  if (isAuthenticated) {
    fetchFavorites();
    fetchUserProducts();
    fetchUserProfile();
    fetchConversations();
  }
}, [isAuthenticated]);

  const toggleFavorite = async (productId: string):Promise<void> => {
    // try {
    //   const res = await api.get(`/favorites/${productId}/`);
    //   const existing = res.data;

    //   if (existing && typeof existing === 'object' && !Array.isArray(existing)) {
    //     // Supprimer le favori
    //     await api.delete(`/favorites/${productId}/`);
    //     return false;
    //   } else {
    //     // Ajouter le favori
    //     await api.post(`/favorites/${productId}/`);
    //     return true
    //   }

    // } catch (error:any) {
    //   console.error('❌ Erreur dans toggleFavorite local:', error?.response ?? error);
    //   return false;
    // }
    try {
      if (favoriteProducts.includes(productId)) {
        await api.delete(`/favorites/${productId}/`);
        setFavoriteProducts(prev => prev.filter(id => id !== productId));
      } else {
        await api.post(`/favorites/${productId}/`);
        setFavoriteProducts(prev => Array.from(new Set([...prev, productId])));
      }
    } catch (e) {
      // Gérer l'erreur si besoin
    }
 
};

  const getProductById = async (id: string) => {
    try {
      const response = await api.get(`/product/${id}/`);
      if (response.status !== 200) throw new Error('Produit introuvable');
      return response.data;
    } catch (error) {
      return undefined;
    }
  };

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        isAuthenticated,
        authToken,
        favoriteProducts,
        userProducts,
        profile,
        setProfile,
        login,
        logout,
        toggleFavorite,
        getProductById,
        setUserProducts, 
        conversations,
        fetchConversations,  
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
