const express = require('express');
const axios = require('axios');
const router = express.Router();


const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3';

const getCookie = async (cookieUrl) => {
    try {
        const response = await axios.get(cookieUrl, { headers: { 'User-Agent': userAgent } });
        const cookies = response.headers['set-cookie'].map(cookie => cookie.split(';')[0]).join('; ');
        return cookies;
    } catch (error) {
        console.error('Error fetching cookie:', error);
        return null;
    }
};

const getProductsAndOffers = async (url, headers, limit = 2, cityId = "552210000") => {
    try {
        const response = await axios.get(url, { headers });
        const products = response.data.data.cards;
        let allProducts = []; 
        for (const product of products) {
            const offerUrl = `https://kaspi.kz/yml/offer-view/offers/${product.id}`;
            const jsonRequestForOffers = convertResponseToJson(product, limit, cityId);
            const offers = await getOffers(offerUrl, jsonRequestForOffers, headers); 
            allProducts.push({ product, offers }); 
        }
        return allProducts; 
    } catch (error) {
        console.error('Error fetching products and offers:', error);
        return []; 
    }
};

const getOffers = async (url, jsonData, headers) => {
    try {
        const response = await axios.post(url, jsonData, { headers });
        return response.data.offers;
    } catch (error) {
        console.error('Error fetching offers:', error);
        return [];
    }
};
const convertResponseToJson = (originalResponse, limit = 2, cityId = "552210000") => ({
    cityId,
    id: originalResponse.id,
    merchantUID: "",
    limit,
    page: 0,
    sort: true,
    product: {
        brand: originalResponse.brand || '',
        categoryCodes: originalResponse.categoryCodes || [],
        baseProductCodes: originalResponse.baseProductCodes || [],
        groups: originalResponse.groups || []
    },
    installationId: "-1"
});


router.get('/fetch-offers', async (req, res) => {
    const cookieUrl = 'https://kaspi.kz/shop/ab/tests/script-cookie?ui=DESKTOP&tg=null';

    const cookie = await getCookie(cookieUrl);
    if (!cookie) {
        return res.status(500).send('Failed to fetch cookie');
    }

    const headersForProducts = {
        'User-Agent': userAgent,
        'Cookie': cookie,
        'Accept': 'application/json, text/*',
        'X-KS-City': '750000000',
        'Referer': 'https://kaspi.kz/'
    };

    const productName = req.query.productName || '';
    const limitOfOffers = parseInt(req.query.limitOfOffers, 10) || 2;
    const url = `https://kaspi.kz/yml/product-view/pl/filters?text=${productName}&hint_chips_click=false&page=0&all=false&fl=true&ui=d&q=:availableInZones:Magnum_ZONE1&i=-1&c=750000000`;

    const response = await getProductsAndOffers(url, headersForProducts, limitOfOffers, '750000000');
    res.json(response); 
});

router.get('/offers', async (req, res) => {

    function generateChartUrl(offers) {
        let labels = offers.map(offer => offer.merchantName);
        let data = offers.map(offer => offer.merchantRating);
        let chartUrl = `https://quickchart.io/chart?c={
          type: 'bar',
          data: {
            labels: ${JSON.stringify(labels)},
            datasets: [{
              label: 'Merchant Ratings',
              data: ${JSON.stringify(data)}
            }]
          },
          options: {
            scales: {
              yAxes: [{
                ticks: {
                  beginAtZero: true,
                  max: 5
                }
              }]
            }
          }
        }`;
        return encodeURI(chartUrl);
      }
      

    const cookieUrl = 'https://kaspi.kz/shop/ab/tests/script-cookie?ui=DESKTOP&tg=null';

    const cookie = await getCookie(cookieUrl);
    if (!cookie) {
        return res.status(500).send('Failed to fetch cookie');
    }

    const headersForProducts = {
        'User-Agent': userAgent,
        'Cookie': cookie,
        'Accept': 'application/json, text/*',
        'X-KS-City': '750000000',
        'Referer': 'https://kaspi.kz/'
    };

    const productName = req.query.productName;
    const limitOfOffers = 10;
    const url = `https://kaspi.kz/yml/product-view/pl/filters?text=${productName}&hint_chips_click=false&page=0&all=false&fl=true&ui=d&q=:availableInZones:Magnum_ZONE1&i=-1&c=750000000`;
    const productsAndOffers = await getProductsAndOffers(url, headersForProducts, limitOfOffers, '750000000');
    res.render('products-offers', { productsAndOffers, generateChartUrl }); // Render EJS with data
});

module.exports = router;