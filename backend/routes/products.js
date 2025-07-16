const express = require('express');
const axios = require('axios');
const router = express.Router();

// Open Beauty Facts API endpoint
const BEAUTY_API_URL = 'https://world.openbeautyfacts.org/cgi/search.pl';

router.get('/:condition', async (req, res) => {
  const { condition } = req.params;
  try {
    const response = await axios.get(BEAUTY_API_URL, {
      params: {
        search_terms: condition,
        search_simple: 1,
        action: 'process',
        json: 1,
        page_size: 10,
      },
    });
    const items = response.data.products || [];
    const products = items.map(item => ({
      name: item.product_name || item.generic_name || 'Unknown',
      brand: item.brands,
      image: item.image_front_url,
      url: item.url,
      ingredients: item.ingredients_text,
      categories: item.categories,
      type: 'Skincare', // Always provide a type
      price: item.price || 'N/A', // Always provide a price (N/A if missing)
    }));
    res.json({ success: true, products });
  } catch (error) {
    console.error('Open Beauty Facts API error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to fetch products', error: error.message });
  }
});

module.exports = router; 