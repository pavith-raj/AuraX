import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image } from 'react-native';
import BottomNavBar from '../../../components/BottomNav';  // adjust the path if needed

const productsData = [
  { id: '1', name: 'Hair Serum', price: '₹499', image: require('../../../assets/images/product1.jpg') },
  { id: '2', name: 'Face Cleanser', price: '₹699', image: require('../../../assets/images/product2.jpg') },
  { id: '3', name: 'Nail Polish Kit', price: '₹299', image: require('../../../assets/images/product3.jpg') },
  // Add more products with actual images
];

const ProductsPage = () => {
  const renderItem = ({ item }) => (
    <View style={styles.productCard}>
      <Image source={item.image} style={styles.productImage} />
      <Text style={styles.productName}>{item.name}</Text>
      <Text style={styles.productPrice}>{item.price}</Text>
      <TouchableOpacity style={styles.addToCartBtn}>
        <Text style={styles.addToCartText}>Add to Cart</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <>
    <View style={styles.container}>
      <Text style={styles.title}>Shop Products</Text>
      <FlatList
        data={productsData}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.productList}
      />
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
  },
  productPrice: {
    fontSize: 14,
    color: '#777',
    marginBottom: 10,
  },
  addToCartBtn: {
    backgroundColor: '#A65E5E',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  addToCartText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default ProductsPage;
