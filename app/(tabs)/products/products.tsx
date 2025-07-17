import React, { useEffect, useState, useRef } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image, ActivityIndicator, Linking, TextInput, Platform, Modal, ScrollView, Animated, Easing, TouchableWithoutFeedback } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BottomNavBar from '../../../components/BottomNav';

interface Product {
  id: string;
  name: string;
  imageUrl?: string;
  description?: string;
  price?: string;
  url?: string;
  brand?: string;
  category?: string;
}

const ProductsPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [brands, setBrands] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [brandModalVisible, setBrandModalVisible] = useState(false);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const searchAnim = useRef(new Animated.Value(1)).current;
  const searchShadowAnim = useRef(new Animated.Value(0.10)).current;
  const noProductsAnim = useRef(new Animated.Value(0)).current;

  // For filter button scale
  const brandBtnScale = useRef(new Animated.Value(1)).current;
  const categoryBtnScale = useRef(new Animated.Value(1)).current;

  // For product card animations
  const cardAnimVals = useRef<Animated.Value[]>([]).current;
  const imageAnimVals = useRef<{ [key: string]: Animated.Value }>({}).current;

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('https://world.openbeautyfacts.org/category/skincare.json');
        const data = await response.json();
        if (data && data.products) {
          const mappedProducts: Product[] = data.products.slice(0, 200).map((item: any, idx: number) => {
            let name = item.product_name || item.brands || item.generic_name || '';
            if (!name) name = 'Unknown Product';
            return {
              id: item.id || item._id || idx.toString(),
              name,
              imageUrl: item.image_front_url,
              description: item.generic_name || '',
              price: item.price || '',
              url: item.url || item.code ? `https://world.openbeautyfacts.org/product/${item.code}` : undefined,
              brand: item.brands,
              category: item.categories_tags && item.categories_tags.length > 0 ? item.categories_tags[0] : '',
            };
          });
          setProducts(mappedProducts);
          const uniqueBrands = Array.from(new Set(mappedProducts.map(p => p.brand).filter((b): b is string => !!b)));
          setBrands(uniqueBrands);
          const uniqueCategories = Array.from(new Set(mappedProducts.map(p => p.category).filter((c): c is string => !!c)));
          setCategories(uniqueCategories);
        } else {
          setError('No products found.');
        }
      } catch (err) {
        setError('Failed to fetch products.');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Filter and search logic
  const filteredProducts = products.filter((item) => {
    const matchesBrand = selectedBrand ? item.brand === selectedBrand : true;
    const matchesCategory = selectedCategory ? item.category === selectedCategory : true;
    const matchesSearch = search.trim() === '' || (
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      (item.brand && item.brand.toLowerCase().includes(search.toLowerCase())) ||
      (item.description && item.description.toLowerCase().includes(search.toLowerCase()))
    );
    return matchesBrand && matchesCategory && matchesSearch;
  });

  // Animate search bar on focus/blur
  const handleSearchFocus = () => {
    setSearchFocused(true);
    Animated.parallel([
      Animated.spring(searchAnim, { toValue: 1.04, useNativeDriver: true }),
      Animated.timing(searchShadowAnim, { toValue: 0.18, duration: 200, useNativeDriver: false })
    ]).start();
  };
  const handleSearchBlur = () => {
    setSearchFocused(false);
    Animated.parallel([
      Animated.spring(searchAnim, { toValue: 1, useNativeDriver: true }),
      Animated.timing(searchShadowAnim, { toValue: 0.10, duration: 200, useNativeDriver: false })
    ]).start();
  };

  // Animate 'No products found' message
  useEffect(() => {
    if (filteredProducts.length === 0) {
      Animated.timing(noProductsAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    } else {
      noProductsAnim.setValue(0);
    }
  }, [filteredProducts.length]);

  // Animate product cards on mount
  useEffect(() => {
    cardAnimVals.length = filteredProducts.length;
    for (let i = 0; i < filteredProducts.length; i++) {
      cardAnimVals[i] = new Animated.Value(0);
    }
    Animated.stagger(80, cardAnimVals.map((val) =>
      Animated.timing(val, { toValue: 1, duration: 400, useNativeDriver: true })
    )).start();
  }, [filteredProducts.length]);

  // Helper for filter button scale
  const animateBtn = (btn: Animated.Value) => {
    Animated.sequence([
      Animated.spring(btn, { toValue: 0.93, useNativeDriver: true }),
      Animated.spring(btn, { toValue: 1, useNativeDriver: true })
    ]).start();
  };

  const renderItem = ({ item, index }: { item: Product, index: number }) => {
    // Image fade-in
    if (!imageAnimVals[item.id]) imageAnimVals[item.id] = new Animated.Value(0);
    return (
      <Animated.View
        style={[
          styles.productCard,
          {
            opacity: cardAnimVals[index] || 0,
            transform: [{ translateY: cardAnimVals[index] ? cardAnimVals[index].interpolate({ inputRange: [0, 1], outputRange: [40, 0] }) : 40 }]
          }
        ]}
      >
        {item.imageUrl ? (
          <Animated.Image
            source={{ uri: item.imageUrl }}
            style={[styles.productImage, { opacity: imageAnimVals[item.id] }]}
            onLoad={() => Animated.timing(imageAnimVals[item.id], { toValue: 1, duration: 400, useNativeDriver: true }).start()}
          />
        ) : (
          <View style={[styles.productImage, { justifyContent: 'center', alignItems: 'center', backgroundColor: '#eee' }]}> 
            <Text style={{ color: '#aaa' }}>No Image</Text>
          </View>
        )}
        <Text style={styles.productName} numberOfLines={1} ellipsizeMode="tail">{item.name}</Text>
        {item.brand && <Text style={styles.productBrand} numberOfLines={1} ellipsizeMode="tail">{item.brand}</Text>}
        {item.description && <Text style={styles.productDescription} numberOfLines={2} ellipsizeMode="tail">{item.description}</Text>}
        {item.price && <Text style={styles.productPrice}>Price: {item.price}</Text>}
        {item.url && (
          <TouchableOpacity style={styles.viewProductBtn} onPress={() => { if (item.url) Linking.openURL(item.url); }}>
            <Text style={styles.viewProductText}>View Product</Text>
          </TouchableOpacity>
        )}
      </Animated.View>
    );
  };

  return (
    <>
      <View style={styles.container}>
        <Text style={styles.title}>Skincare Products</Text>
        {/* Improved Search Bar */}
        <Animated.View
          style={[
            styles.searchBarWrapper,
            {
              transform: [{ scale: searchAnim }],
              shadowOpacity: searchShadowAnim,
            },
          ]}
        >
          <Ionicons name="search" size={22} color="#A65E5E" style={styles.searchIcon} />
          <TextInput
            style={styles.searchBar}
            placeholder="Search products, brands, or description..."
            value={search}
            onChangeText={setSearch}
            placeholderTextColor="#A65E5E"
            underlineColorAndroid="transparent"
            onFocus={handleSearchFocus}
            onBlur={handleSearchBlur}
          />
        </Animated.View>
        {/* Filter Row: Brand and Category in same line */}
        <View style={styles.filterRowCombined}>
          <View style={styles.filterRowHalf}>
            <Text style={styles.filterLabel}>Brand:</Text>
            <TouchableWithoutFeedback
              onPressIn={() => animateBtn(brandBtnScale)}
              onPress={() => setBrandModalVisible(true)}
            >
              <Animated.View style={[styles.filterBtn, { transform: [{ scale: brandBtnScale }] }]}> 
                <Text style={styles.filterBtnText}>{selectedBrand || 'All'}</Text>
              </Animated.View>
            </TouchableWithoutFeedback>
          </View>
          <View style={styles.filterRowHalf}>
            <Text style={styles.filterLabel}>Category:</Text>
            <TouchableWithoutFeedback
              onPressIn={() => animateBtn(categoryBtnScale)}
              onPress={() => setCategoryModalVisible(true)}
            >
              <Animated.View style={[styles.filterBtn, { transform: [{ scale: categoryBtnScale }] }]}> 
                <Text style={styles.filterBtnText}>{selectedCategory ? selectedCategory.replace('en:', '') : 'All'}</Text>
              </Animated.View>
            </TouchableWithoutFeedback>
          </View>
        </View>
        {/* Brand Modal */}
        <Modal visible={brandModalVisible} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Select Brand</Text>
              <ScrollView>
                <TouchableOpacity style={styles.modalOption} onPress={() => { setSelectedBrand(''); setBrandModalVisible(false); }}>
                  <Text style={styles.modalOptionText}>All</Text>
                </TouchableOpacity>
                {brands.map((brand) => (
                  <TouchableOpacity key={brand} style={styles.modalOption} onPress={() => { setSelectedBrand(brand); setBrandModalVisible(false); }}>
                    <Text style={styles.modalOptionText}>{brand}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setBrandModalVisible(false)}>
                <Text style={styles.modalCloseBtnText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
        {/* Category Modal */}
        <Modal visible={categoryModalVisible} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Select Category</Text>
              <ScrollView>
                <TouchableOpacity style={styles.modalOption} onPress={() => { setSelectedCategory(''); setCategoryModalVisible(false); }}>
                  <Text style={styles.modalOptionText}>All</Text>
                </TouchableOpacity>
                {categories.map((cat) => (
                  <TouchableOpacity key={cat} style={styles.modalOption} onPress={() => { setSelectedCategory(cat); setCategoryModalVisible(false); }}>
                    <Text style={styles.modalOptionText}>{cat.replace('en:', '')}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setCategoryModalVisible(false)}>
                <Text style={styles.modalCloseBtnText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
        {loading ? (
          <ActivityIndicator size="large" color="#A65E5E" style={{ marginTop: 40 }} />
        ) : error ? (
          <Text style={{ color: 'red', marginTop: 40 }}>{error}</Text>
        ) : filteredProducts.length === 0 ? (
          <Animated.Text style={{ color: '#A65E5E', marginTop: 40, textAlign: 'center', fontSize: 16, opacity: noProductsAnim }}>
            No products found.
          </Animated.Text>
        ) : (
          <FlatList
            data={filteredProducts}
            renderItem={({ item, index }) => renderItem({ item, index })}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.productList}
            numColumns={2}
            columnWrapperStyle={styles.row}
          />
        )}
      </View>
      <BottomNavBar activeTab='products' />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EAD8D8',
    padding: 16,
    paddingTop: 60,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#3B3B3B',
    marginBottom: 16,
    textAlign: 'center',
  },
  searchBarWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 28,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 8 : 4,
    marginBottom: 16,
    shadowColor: '#A65E5E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 8,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchBar: {
    flex: 1,
    backgroundColor: 'transparent',
    fontSize: 17,
    color: '#3B3B3B',
    paddingVertical: Platform.OS === 'ios' ? 10 : 6,
    borderWidth: 0,
  },
  filterRowCombined: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  filterRowHalf: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  filterLabel: {
    fontWeight: 'bold',
    marginRight: 8,
    color: '#A65E5E',
    fontSize: 15,
  },
  filterBtn: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#A65E5E',
  },
  filterBtnText: {
    color: '#A65E5E',
    fontWeight: 'bold',
    fontSize: 15,
  },
  row: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  productList: {
    paddingBottom: 100,
  },
  productCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    flex: 1,
    marginHorizontal: 4,
    minWidth: 0,
    maxWidth: '48%',
    minHeight: 260,
  },
  productImage: {
    width: '100%',
    height: 120,
    borderRadius: 12,
    resizeMode: 'cover',
    marginBottom: 12,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#A65E5E',
    marginBottom: 6,
    textAlign: 'center',
    maxWidth: '100%',
  },
  productBrand: {
    fontSize: 14,
    color: '#888',
    marginBottom: 4,
    textAlign: 'center',
    maxWidth: '100%',
  },
  productDescription: {
    fontSize: 13,
    color: '#555',
    marginBottom: 6,
    textAlign: 'center',
    maxWidth: '100%',
  },
  productPrice: {
    fontSize: 14,
    color: '#777',
    marginBottom: 10,
    textAlign: 'center',
  },
  viewProductBtn: {
    backgroundColor: '#A65E5E',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 8,
  },
  viewProductText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '80%',
    maxHeight: '70%',
    alignItems: 'center',
  },
  modalTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 12,
    color: '#A65E5E',
  },
  modalOption: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    width: '100%',
    alignItems: 'center',
  },
  modalOptionText: {
    fontSize: 16,
    color: '#3B3B3B',
  },
  modalCloseBtn: {
    marginTop: 16,
    backgroundColor: '#A65E5E',
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  modalCloseBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
});

export default ProductsPage;

