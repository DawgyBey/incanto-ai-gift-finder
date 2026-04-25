const express = require('express');
const router = express.Router();
require('dotenv').config();

router.get('/product', async (req, res) => {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'Please provide a product URL' });
  }

  try {
    const response = await fetch(
      `https://daraz-product-details.p.rapidapi.com/ProductDetail?url=${encodeURIComponent(url)}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-rapidapi-key': process.env.RAPIDAPI_KEY,
          'x-rapidapi-host': process.env.RAPIDAPI_HOST
        }
      }
    );

    const data = await response.json();
    console.log('Daraz API response:', data); // helps you see what comes back

    res.json(data);

  } catch (error) {
    console.error('Error fetching from Daraz API:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

module.exports = router;