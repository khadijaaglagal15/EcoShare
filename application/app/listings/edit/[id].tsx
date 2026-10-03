import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator, Image, Switch } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { theme } from '@/constants/theme';
import api from '../../api';
import {IP} from '../../api';
import { useApp } from '@/context/AppContext';
import * as ImagePicker from 'expo-image-picker';
import { Camera, Upload, ImagePlus, Tag, MapPin, DollarSign, ChevronDown } from 'lucide-react-native';
import { Picker } from '@react-native-picker/picker';

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

export default function EditProductScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { setUserProducts } = useApp();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [product, setProduct] = useState<any>(null);
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const [images, setImages] = useState<any[]>([]);
  const [categories, setCategories] = useState<{ id: number, name: string }[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [conditions] = useState(['New', 'Like New', 'Used', 'Good']);
  const [sold, setSold] = useState(false);
  // Ajoute d'autres champs si besoin


    
  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/product/${id}/`);
        setProduct(res.data);
        setTitle(res.data.title || '');
        setPrice(res.data.price?.toString() || '');
        setDescription(res.data.description || '');
        setLocation(res.data.location || '');
        setCategory(res.data.category?.toString() || '');
        setStatus(res.data.status || '');
        setImages(res.data.images || []);
        setSold(res.data.sold || false);
      } catch (e) {
        Alert.alert('Error', "Couldn't load product.");
        router.back();
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchProduct();
  }, [id]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/categories/');
        setCategories(res.data);
      } catch (e) {
        setCategories([]);
      }
    };
    fetchCategories();
  }, []);

  const handleSave = async () => {
    if (!title || !description || !location) {
      Alert.alert('Error', 'Please fill all required fields.');
      return;
    }
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('price', price);
      formData.append('description', description);
      formData.append('location', location);
      formData.append('category', category);
      formData.append('status', status);
      formData.append('sold', sold ? 'true' : 'false');

      // Ajoute les nouvelles images locales (pas encore uploadées)
      images
        .filter(img => img.uri && !img.id) // images locales uniquement
        .forEach((img, index) => {
          formData.append('images', {
            uri: img.uri,
            name: `image_${index}_${Date.now()}.jpg`,
            type: 'image/jpeg',
          } as any);
        });

      // Envoie la requête PUT/PATCH
      const res = await api.put(`/user-products/?id=${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // Mets à jour la liste globale
      setUserProducts(prev =>
        prev.map(p => (p.id === res.data.id ? res.data : p))
      );
      Alert.alert('Success', 'Product updated!');
      router.back();
    } catch (e) {
      Alert.alert('Error', "Couldn't update product.");
    } finally {
      setSaving(false);
    }
  };

  const handleAddImage = async () => {
    // Logique pour ajouter une image (ouvrir la galerie, prendre une photo, etc.)
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
      setImages([...images, { uri: result.assets[0].uri }]);
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
      setImages([...images, { uri: result.assets[0].uri }]);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.label}>Title</Text>
      <TextInput
        style={styles.input}
        value={title}
        onChangeText={setTitle}
        placeholder="Product title"
      />

      <Text style={styles.label}>Price</Text>
      <TextInput
        style={styles.input}
        value={price}
        onChangeText={setPrice}
        placeholder="Price"
        keyboardType="numeric"
      />

      <Text style={styles.label}>Description</Text>
      <TextInput
        style={[styles.input, { height: 80 }]}
        value={description}
        onChangeText={setDescription}
        placeholder="Description"
        multiline
      />

      <Text style={styles.label}>Location</Text>
      <TextInput
        style={styles.input}
        value={location}
        onChangeText={setLocation}
        placeholder="Location"
      />

      

      <Text style={styles.label}>Category</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={category}
          onValueChange={(itemValue: string) => setCategory(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="Select a category" value="" />
          {categories.map(cat => (
            <Picker.Item key={cat.id} label={cat.name} value={cat.id.toString()} />
          ))}
        </Picker>
      </View>

      <Text style={styles.label}>Condition</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={status}
          onValueChange={(itemValue: string) => setStatus(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="Select condition" value="" />
          {conditions.map(cond => (
            <Picker.Item key={cond} label={cond} value={cond} />
          ))}
        </Picker>
      </View>

      <Text style={styles.label}>Images</Text>
      <View style={styles.imagesContainer}>
        {images.map((img, idx) => (
          <View key={img.id || img.uri || idx} style={styles.imageWrapper}>
            <Image
              source={{ uri: img.id ? `${IP}${img.image}` : img.uri }}
              style={styles.editImage}
            />
            <TouchableOpacity
              style={styles.deleteImageButton}
              onPress={async () => {
                if (img.id) {
                  // Image déjà sur le backend
                  try {
                    await api.delete(`/user-products-image/${img.id}/`);
                    setImages(prev => prev.filter(i => i.id !== img.id));
                  } catch (e) {
                    Alert.alert('Error', "Couldn't delete image.");
                  }
                } else {
                  // Image locale
                  setImages(prev => prev.filter((_, i) => i !== idx));
                }
              }}
            >
              <Text style={styles.deleteImageText}>✕</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      <View style={{ flexDirection: 'row', marginBottom: 16 }}>
        {images.length < 5 && (
          <>
            <TouchableOpacity
                style={styles.photoUpload}
                onPress={takePhoto}>
                <Camera size={24} color={COLORS.success} />
                <Text style={styles.photoText}>Take photo</Text>
              </TouchableOpacity>
            <TouchableOpacity
                style={styles.photoUpload}
                onPress={pickImage}>
                <ImagePlus size={24} color={COLORS.success} />
                <Text style={styles.photoText}>Choose from library</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
        <Text style={styles.label}>Mark as Sold</Text>
        <Switch
          value={sold}
          onValueChange={setSold}
          style={{ marginLeft: 12 }}
        />
      </View>

      {/* Ajoute ici d'autres champs si besoin (catégorie, statut, etc.) */}

      <TouchableOpacity
        style={styles.saveButton}
        onPress={handleSave}
        disabled={saving}
      >
        <Text style={styles.saveButtonText}>
          {saving ? 'Saving...' : 'Save Changes'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: '#fff',
    flexGrow: 1,
  },
  label: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    marginBottom: 6,
    color: theme.colors.black,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.gray[300],
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
    fontSize: 15,
    backgroundColor: '#F9F9F9',
  },
  saveButton: {
    backgroundColor: theme.colors.primary,
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 16,
  },
  saveButtonText: {
    color: '#fff',
    fontFamily: 'Inter-Bold',
    fontSize: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  imageWrapper: {
    position: 'relative',
    marginRight: 10,
    marginBottom: 10,
  },
  editImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  deleteImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 2,
    elevation: 2,
  },
  deleteImageText: {
    color: 'red',
    fontWeight: 'bold',
    fontSize: 16,
  },
  addImageButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
    marginBottom: 16,
    flex: 1,
    marginRight: 8,
  },
  addImageText: {
    color: '#fff',
    fontWeight: 'bold',
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
  dropdownContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  dropdown: {
    borderWidth: 1,
    borderColor: theme.colors.gray[300],
    borderRadius: 8,
    padding: 10,
    backgroundColor: '#F9F9F9',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownText: {
    fontSize: 15,
    color: theme.colors.black,
  },
  dropdownList: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: theme.colors.gray[300],
    borderRadius: 8,
    marginTop: 8,
    zIndex: 1000,
  },
  dropdownItem: {
    padding: 10,
  },
  dropdownItemText: {
    fontSize: 15,
    color: theme.colors.black,
  },
  conditionContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  conditionButton: {
    borderWidth: 1,
    borderColor: theme.colors.gray[300],
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#F9F9F9',
    marginRight: 8,
    marginBottom: 8,
  },
  conditionButtonSelected: {
    backgroundColor: theme.colors.primary,
  },
  conditionButtonText: {
    fontSize: 15,
    color: theme.colors.black,
  },
  conditionButtonTextSelected: {
    color: '#fff',
    fontWeight: 'bold',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: theme.colors.gray[300],
    borderRadius: 8,
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
  },
  picker: {
    height: 45,
    width: '100%',
  },
});
