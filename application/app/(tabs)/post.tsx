import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, Modal, FlatList, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '@/context/AppContext';
import { useRouter } from 'expo-router';
import { Camera, Upload, ImagePlus, Tag, MapPin, DollarSign, ChevronDown } from 'lucide-react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import Button from '@/components/Button';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import api from '../api';
// Update these with your actual backend base URL
const BASE_URL = 'http://192.168.50.187:8000/app';
const API_ENDPOINTS = {
  createProduct: `${BASE_URL}/user-products/`,
  uploadImage: `${BASE_URL}/user-products-image/`, // Note: You'll need to handle image uploads differently
  getCategories: `${BASE_URL}/categories/`,
};

const COLORS = {
  primary: '#6C63FF',
  secondary: '#25CED1',
  accent: '#FF8576',
  success: '#48BB78',
  warning: '#F6AD55',
  background: '#F5F7FA',
  white: '#FFFFFF',
  gray: '#718096',
  dark: '#2A2B47',
};

const CONDITIONS = ['New', 'Like New', 'Used', 'Good'];

export default function PostScreen() {
  const { isAuthenticated, user,setUserProducts, authToken, logout } = useApp(); // Make sure authToken is available in your context
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [categories, setCategories] = useState<{ id: number, name: string }[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedCondition, setSelectedCondition] = useState<string>('');
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [conditionModalVisible, setConditionModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedCategoryObj, setSelectedCategoryObj] = useState<{ id: number, name: string } | null>(null); // For full category object
  const [status, setStatus] = useState('good');
  // Fetch categories from your Django backend
  React.useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get<{ id: number; name: string }[]>('/categories/');
        setCategories(response.data); 
      } catch (error) {
        console.error('Failed to fetch categories:', error);
        if (axios.isAxiosError(error)) {
          if (error.response?.status === 401) {
            Alert.alert('Session Expired', 'Please login again');
            logout();
            router.replace('/auth/login');
          }
        }
        Alert.alert('Error', 'Failed to load categories');
      }
    };

    fetchCategories();
  }, []);

  const navigateToLogin = () => {
    router.push('/auth/login');
  };

  const pickImage = async () => {
    if (images.length >= 5) {
      Alert.alert('Maximum 5 images allowed');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });

    if (!result.canceled) {
      setImages([...images, result.assets[0].uri]);
    }
  };

  const takePhoto = async () => {
    if (images.length >= 5) {
      Alert.alert('Maximum 5 images allowed');
      return;
    }

    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });

    if (!result.canceled) {
      setImages([...images, result.assets[0].uri]);
    }
  };

  const removeImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
  };

  const uploadImages = async (imageUris: string[]) => {
    const uploadedImages: string[] = [];

    for (const uri of imageUris) {
      const formData = new FormData();
      // Create a proper file object for React Native
      const file = {
        uri,
        name: `image_${Date.now()}.jpg`,
        type: 'image/jpeg',
      } as any; // Temporary any type to bypass TypeScript issues with React Native FormData

      formData.append('images', file);

      try {
        const response = await axios.post(API_ENDPOINTS.uploadImage, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${authToken}`,
          },
        });
        uploadedImages.push(response.data.url);
      } catch (error) {
        console.error('Image upload failed:', error);
        throw error;
      }
    }

    return uploadedImages;
  };

  const handlePost = async () => {

    if (!title || !price || !description || !selectedCategory || !selectedCondition || !location) {
      Alert.alert('Error', 'Please fill all required fields.');
      return;
    }

    if (images.length === 0) {
      Alert.alert('Error', 'Please add at least one photo.');
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();

      // Append product data
      formData.append('title', title);
      formData.append('price', price);
      formData.append('description', description);
      formData.append('category', selectedCategoryObj?.id.toString() || '0');
      formData.append('status', status);
      formData.append('condition', selectedCondition);
      formData.append('location', location);

      // Append images
      images.forEach((uri, index) => {
        formData.append('images', {
          uri,
          name: `image_${index}_${Date.now()}.jpg`,
          type: 'image/jpeg',
        } as any); // Type assertion for React Native FormData
      });

      console.log('Posting with data:', { title, price, description, selectedCategory, selectedCondition, location, images });

      const response = await api.post('/user-products/', formData, {
  headers: {
    'Content-Type': 'multipart/form-data',
  },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const progress = Math.round((progressEvent.loaded / progressEvent.total) * 100);
            setUploadProgress(progress);
          }
        },
      });

      if (response.data) {
        const res = await api.get('/user-products/');
        setUserProducts(res.data);
      }

      // Ajoute ce bloc pour vider les champs :
      setTitle('');
      setPrice('');
      setDescription('');
      setLocation('');
      setImages([]);
      setSelectedCategory('');
      setSelectedCategoryObj(null);
      setSelectedCondition('');
      setStatus('good');

      Alert.alert('Success', 'Your product has been posted successfully!');
      router.replace('/');
    } catch (error: unknown) {
      console.error('Failed to post product:', error);
      let errorMessage = 'Failed to post product. Please try again.';

      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          errorMessage = 'Please log in to post products.';
        } else if (error.response?.data) {
          errorMessage = typeof error.response.data === 'string'
            ? error.response.data
            : JSON.stringify(error.response.data);
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
      setUploadProgress(0);
    }
  };

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Post an Item</Text>
        </View>
        <Animated.View entering={FadeIn.duration(400)} style={styles.authContainer}>
          <Upload size={64} color={COLORS.primary} />
          <Text style={styles.authTitle}>Ready to sell?</Text>
          <Text style={styles.authText}>
            Log in to post your items and connect with local buyers.
          </Text>
          <Button title="Log in" onPress={navigateToLogin} size="large" style={styles.authButton} />
        </Animated.View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Create a New Listing</Text>
      </View>

      {isLoading && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>
              {uploadProgress > 0 ? `Uploading images... ${uploadProgress}%` : 'Posting your product...'}
            </Text>
          </View>
        </View>
      )}

      <ScrollView
        style={styles.form}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.formContent}
      >
        {/* Photos Section */}
        <Text style={styles.sectionTitle}>Photos</Text>
        <Text style={styles.sectionDescription}>
          Add up to 5 photos of your item ({images.length}/5)
        </Text>
        <View style={styles.photoGrid}>
          {images.map((uri, index) => (
            <View key={index} style={styles.imageContainer}>
              <Image source={{ uri }} style={styles.image} />
              <TouchableOpacity
                style={styles.removeImageButton}
                onPress={() => removeImage(index)}
              >
                <Text style={styles.removeImageText}>×</Text>
              </TouchableOpacity>
            </View>
          ))}
          {images.length < 5 && (
            <>
              <TouchableOpacity
                style={styles.photoUpload}
                onPress={takePhoto}
              >
                <Camera size={24} color={COLORS.success} />
                <Text style={styles.photoText}>Take photo</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.photoUpload}
                onPress={pickImage}
              >
                <ImagePlus size={24} color={COLORS.success} />
                <Text style={styles.photoText}>Choose from library</Text>
              </TouchableOpacity>
            </>
          )}
          {[...Array(5 - Math.max(images.length, 2))].map((_, index) => (
            <View key={`empty-${index}`} style={[styles.photoUpload, styles.photoUploadEmpty]} />
          ))}
        </View>

        {/* Title Section */}
        <Text style={styles.sectionTitle}>Title</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Enter a descriptive title"
          placeholderTextColor={COLORS.gray}
          value={title}
          onChangeText={setTitle}
        />

        {/* Price Section */}
        <Text style={styles.sectionTitle}>Price</Text>
        <View style={styles.priceInput}>
          <DollarSign size={20} color={COLORS.primary} />
          <TextInput
            style={styles.priceTextInput}
            placeholder="0"
            keyboardType="numeric"
            placeholderTextColor={COLORS.gray}
            value={price}
            onChangeText={setPrice}
          />
        </View>

        {/* Category Section */}
        <Text style={styles.sectionTitle}>Category</Text>
        <TouchableOpacity
          style={styles.selector}
          onPress={() => setCategoryModalVisible(true)}
        >
          <Tag size={20} color={COLORS.primary} />
          <Text style={selectedCategory ? styles.selectorTextSelected : styles.selectorText}>
            {selectedCategory || 'Select a category'}
          </Text>
          <ChevronDown size={20} color={COLORS.gray} style={styles.selectorIcon} />
        </TouchableOpacity>

        {/* Condition Section */}
        <Text style={styles.sectionTitle}>Condition</Text>
        <TouchableOpacity
          style={styles.selector}
          onPress={() => setConditionModalVisible(true)}
        >
          <Text style={selectedCondition ? styles.selectorTextSelected : styles.selectorText}>
            {selectedCondition || 'Select condition'}
          </Text>
          <ChevronDown size={20} color={COLORS.gray} style={styles.selectorIcon} />
        </TouchableOpacity>

        {/* Location Section */}
        <Text style={styles.sectionTitle}>Location</Text>
        <View style={styles.locationInput}>
          <MapPin size={20} color={COLORS.success} />
          <TextInput
            style={styles.locationTextInput}
            placeholder="Enter your location"
            placeholderTextColor={COLORS.gray}
            value={location}
            onChangeText={setLocation}
          />
        </View>

        {/* Description Section */}
        <Text style={styles.sectionTitle}>Description</Text>
        <TextInput
          style={[styles.textInput, styles.textArea]}
          placeholder="Describe your item in detail..."
          multiline={true}
          numberOfLines={6}
          placeholderTextColor={COLORS.gray}
          textAlignVertical="top"
          value={description}
          onChangeText={setDescription}
        />
      </ScrollView>

      {/* Floating Submit Button */}
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={handlePost}
        disabled={isLoading}
      >
        <Text style={styles.floatingButtonText}>Post</Text>
      </TouchableOpacity>

      {/* Category Modal */}
      <Modal visible={categoryModalVisible} transparent={true} animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setCategoryModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <FlatList
              data={categories}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.modalItem,
                    selectedCategory === item.name && styles.modalItemSelected
                  ]}
                  onPress={() => {
                    setSelectedCategory(item.name);
                    setSelectedCategoryObj(item);
                    setCategoryModalVisible(false);
                  }}
                >
                  <Text style={[
                    styles.modalText,
                    selectedCategory === item.name && { color: COLORS.primary }
                  ]}>
                    {item.name}
                  </Text>
                  {selectedCategory === item.name && (
                    <View style={styles.selectedIndicator} />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Condition Modal */}
      <Modal visible={conditionModalVisible} transparent={true} animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setConditionModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <FlatList
              data={CONDITIONS}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.modalItem,
                    selectedCondition === item && styles.modalItemSelected
                  ]}
                  onPress={() => {
                    setSelectedCondition(item);
                    setConditionModalVisible(false);
                  }}
                >
                  <Text style={styles.modalText}>{item}</Text>
                  {selectedCondition === item && (
                    <View style={styles.selectedIndicator} />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  authContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  authTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: COLORS.dark,
    marginTop: 20,
  },
  authText: {
    fontSize: 16,
    color: COLORS.gray,
    textAlign: 'center',
    marginVertical: 15,
    lineHeight: 22,
  },
  authButton: {
    marginTop: 10,
    width: '100%',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.dark,
  },
  form: {
    flex: 1,
  },
  formContent: {
    padding: 16,
    paddingBottom: 100,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: COLORS.gray,
    marginBottom: 16,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  photoUpload: {
    width: '48%',
    height: 120,
    backgroundColor: COLORS.white,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.gray,
    borderStyle: 'dashed',
  },
  photoUploadEmpty: {
    borderStyle: 'dotted',
    borderColor: '#eee',
  },
  photoText: {
    fontSize: 14,
    color: COLORS.gray,
    marginTop: 8,
  },
  imageContainer: {
    width: '48%',
    height: 120,
    marginBottom: 16,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(0,0,0,0.6)',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeImageText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    lineHeight: 20,
  },
  textInput: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
    padding: 12,
    fontSize: 16,
    color: COLORS.dark,
    marginBottom: 24,
  },
  priceInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
    marginBottom: 24,
    paddingHorizontal: 12,
  },
  priceTextInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    color: COLORS.dark,
  },
  locationInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
    marginBottom: 24,
    paddingHorizontal: 12,
  },
  locationTextInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    color: COLORS.dark,
    marginLeft: 8,
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
    padding: 12,
    marginBottom: 24,
  },
  selectorText: {
    flex: 1,
    fontSize: 16,
    color: COLORS.gray,
    marginLeft: 8,
  },
  selectorTextSelected: {
    flex: 1,
    fontSize: 16,
    color: COLORS.dark,
    marginLeft: 8,
  },
  selectorIcon: {
    marginLeft: 8,
  },
  textArea: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  floatingButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: COLORS.primary,
    borderRadius: 28,
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
  floatingButtonText: {
    color: COLORS.white,
    fontWeight: '600',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    width: '80%',
    maxHeight: '60%',
  },
  modalItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalItemSelected: {
    backgroundColor: '#f5f5ff',
  },
  modalText: {
    fontSize: 16,
    color: COLORS.dark,
  },
  selectedIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingContainer: {
    backgroundColor: COLORS.white,
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    elevation: 4,
  },
  categoryItem: {
    padding: 12,
    marginVertical: 4,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  selectedCategoryItem: {
    backgroundColor: '#6C63FF',
  },
  categoryText: {
    fontSize: 16,
    color: '#333',
  },
  selectedCategoryText: {
    color: '#fff',
  },
  loadingText: {
    marginTop: 10,
    color: COLORS.dark,
  },
});