import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  TextInput,
  Animated,
} from 'react-native';
import { theme } from '@/constants/theme';
import { ChevronDown, MapPin, X } from 'lucide-react-native';
import { citiesList } from '@/data/mockData';

type SearchFilterProps = {
  selectedCity: string | null;
  onCitySelect: (city: string | null) => void;
};

export default function SearchFilter({ selectedCity, onCitySelect }: SearchFilterProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [cityList, setCityList] = useState(citiesList);
  const scaleAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    setCityList(
      citiesList.filter(city =>
        city.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [searchTerm]);

  const toggleModal = () => {
    Animated.spring(scaleAnim, {
      toValue: modalVisible ? 0 : 1,
      friction: 6,
      useNativeDriver: true,
    }).start();
    setModalVisible(!modalVisible);
  };

  const handleSelectCity = (city: string) => {
    onCitySelect(city);
    toggleModal();
  };

  const clearCity = () => {
    onCitySelect(null);
  };

  return (
    <>
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={toggleModal}
          activeOpacity={0.7}
        >
          <MapPin size={16} color={selectedCity ? theme.colors.primary : theme.colors.gray[500]} />
          <Text
            style={[styles.filterText, selectedCity && styles.activeFilterText]}
            numberOfLines={1}
          >
            {selectedCity || 'Choose a city'}
          </Text>
          <ChevronDown size={16} color={theme.colors.gray[500]} />
        </TouchableOpacity>

        {selectedCity && (
          <TouchableOpacity style={styles.clearContainer} onPress={clearCity} activeOpacity={0.7}>
            <X size={16} color={theme.colors.gray[500]} />
            <Text style={styles.clearText}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>

      <Modal
        animationType="fade"
        transparent
        visible={modalVisible}
        onRequestClose={toggleModal}
      >
        <View style={styles.modalBackdrop}>
          <Animated.View style={[styles.modalContent, { transform: [{ scale: scaleAnim }] }]}>
            <View style={styles.modalHeader}>
              <View style={styles.titleContainer}>
                <Text style={styles.modalTitle}>Where are you looking?</Text>
                <Text style={styles.modalSubtitle}>
                  Select a city to refine your results
                </Text>
              </View>
              <TouchableOpacity onPress={toggleModal} activeOpacity={0.7}>
                <X size={20} color={theme.colors.gray[700]} />
              </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Enter city name..."
                value={searchTerm}
                onChangeText={setSearchTerm}
                placeholderTextColor={theme.colors.gray[500]}
              />
            </View>

            {cityList.length === 0 ? (
              <View style={styles.noResult}>
                <Text style={styles.noResultText}>
                  Sorry, no cities match your search.
                </Text>
              </View>
            ) : (
              <FlatList
                data={cityList}
                keyExtractor={item => item}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.cityItem,
                      selectedCity === item && styles.selectedCityItem,
                    ]}
                    onPress={() => handleSelectCity(item)}
                    activeOpacity={0.7}
                  >
                    <MapPin
                      size={16}
                      color={selectedCity === item ? theme.colors.primary : theme.colors.gray[600]}
                    />
                    <Text
                      style={[
                        styles.cityText,
                        selectedCity === item && styles.selectedCityText,
                      ]}
                    >
                      {item}
                    </Text>
                  </TouchableOpacity>
                )}
                showsVerticalScrollIndicator={false}
              />
            )}
          </Animated.View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.gray[200],
    maxWidth: 160,
    ...theme.shadow.small,
  },
  filterText: {
    fontFamily: 'Inter-Regular',
    fontSize: theme.fontSize.sm,
    color: theme.colors.gray[600],
    marginHorizontal: theme.spacing.sm,
    flex: 1,
  },
  activeFilterText: {
    color: theme.colors.primary,
    fontFamily: 'Inter-Medium',
  },
  clearContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: theme.spacing.sm,
    backgroundColor: theme.colors.gray[100],
    padding: theme.spacing.xs,
    borderRadius: theme.borderRadius.round,
    ...theme.shadow.small,
  },
  clearText: {
    marginLeft: theme.spacing.xs,
    fontFamily: 'Inter-Regular',
    fontSize: theme.fontSize.sm,
    color: theme.colors.gray[500],
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: theme.colors.white,
    borderTopLeftRadius: theme.borderRadius.lg,
    borderTopRightRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.lg,
  },
  titleContainer: {
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  modalTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: theme.fontSize.lg,
    color: theme.colors.black,
  },
  modalSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: theme.fontSize.sm,
    color: theme.colors.gray[600],
    marginTop: theme.spacing.xs,
  },
  searchContainer: {
    marginBottom: theme.spacing.md,
  },
  searchInput: {
    backgroundColor: theme.colors.gray[100],
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    fontFamily: 'Inter-Regular',
    fontSize: theme.fontSize.md,
    color: theme.colors.black,
  },
  cityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray[200],
  },
  selectedCityItem: {
    backgroundColor: theme.colors.primaryLight + '20',
  },
  cityText: {
    fontFamily: 'Inter-Regular',
    fontSize: theme.fontSize.md,
    color: theme.colors.gray[800],
    marginLeft: theme.spacing.md,
  },
  selectedCityText: {
    color: theme.colors.primary,
    fontFamily: 'Inter-Medium',
  },
  noResult: {
    padding: theme.spacing.lg,
    alignItems: 'center',
  },
  noResultText: {
    fontFamily: 'Inter-Regular',
    fontSize: theme.fontSize.sm,
    color: theme.colors.gray[500],
    textAlign: 'center',
  },
});