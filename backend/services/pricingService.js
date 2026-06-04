import axios from 'axios';
import * as cheerio from 'cheerio';

class PricingService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 1000 * 60 * 60; // 1 hour
  }

  async getLivePrice(gift) {
    const cacheKey = gift.id;

    // Check cache first
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.price;
      }
    }

    let price = gift.price; // fallback to static price

    try {
      let livePrice = null;
      if (gift.link && gift.link.includes('daraz.com.np')) {
        livePrice = await this.scrapeDarazPrice(gift.link);
      }

      if (typeof livePrice === 'number' && livePrice > 0) {
        price = livePrice;
      } else if (livePrice !== null) {
        console.warn(`Live price for gift ${gift.id} is invalid (${livePrice}); keeping static price ${gift.price}.`);
      }
    } catch (error) {
      console.error(`Error fetching price for gift ${gift.id}:`, error.message);
      // Keep static price as fallback
    }

    // Cache the result
    this.cache.set(cacheKey, { price, timestamp: Date.now() });

    return price;
  }

  async scrapeDarazPrice(url) {
    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });

      const $ = cheerio.load(response.data);

      // Daraz price selector - this may need adjustment based on actual HTML
      const priceText = $('span.price').first().text() ||
                       $('span[itemprop="price"]').first().text() ||
                       $('.price').first().text();

      // Extract numeric price
      const priceMatch = priceText.match(/Rs\.?\s*([\d,]+)/);
      if (priceMatch) {
        return parseFloat(priceMatch[1].replace(/,/g, ''));
      }
    } catch (error) {
      console.error('Error scraping Daraz:', error.message);
    }

    return 0;
  }

  async updateAllPrices(gifts) {
    const updatedGifts = await Promise.all(
      gifts.map(async (gift) => ({
        ...gift,
        price: await this.getLivePrice(gift)
      }))
    );

    return updatedGifts;
  }
}

export const pricingService = new PricingService();
