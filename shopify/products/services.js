import dotenv from "dotenv";
dotenv.config();
import "@shopify/shopify-api/adapters/node";
import { shopifyApi } from "@shopify/shopify-api";
import fs from "fs";
import path from "path";

const shopify = shopifyApi({
  adminApiAccessToken: process.env.SHOPIFY_ACCESS_TOKEN,
  apiVersion: process.env.SHOPIFY_API_VERSION,
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET,
  hostName: process.env.SHOPIFY_HOST_NAME || "localhost",
  scopes: ["read_products", "write_products", "read_media", "write_media"],
});

const session = {
  shop: process.env.SHOPIFY_SHOP_NAME,
  accessToken: process.env.SHOPIFY_ACCESS_TOKEN,
};

/**
 * Initializes Shopify API client
 * @returns {object} Shopify Rest client
 */
function initializeShopifyClient() {
  return new shopify.clients.Rest({ session: session });
}

/**
 * Create a new product on Shopify
 * @param {Object} productData - Product data to create
 * @returns {Object} The created product object
 */
async function createProduct(productData) {
  const shopifyClient = initializeShopifyClient();
  try {
    const response = await shopifyClient.post({
      path: "products.json",
      data: { product: productData },
      //   type: shopify.clients.Rest.DataType.JSON, // Updated line
    });
    console.log("Product created successfully:", response.body);
    return response.body.product;
  } catch (error) {
    console.error("Failed to create product:", error);
    throw error;
  }
}

/**
 * Retrieve a product by ID
 * @param {string} productId - ID of the product to retrieve
 * @returns {Object} The retrieved product object
 */
async function getProductById(productId) {
  const shopifyClient = initializeShopifyClient();
  try {
    const response = await shopifyClient.get({
      path: `products/${productId}.json`,
      //   type: shopify.clients.Rest.DataType.JSON, // Updated line
    });
    console.log("Product retrieved successfully:", response.body);
    return response.body.product;
  } catch (error) {
    console.error(`Failed to retrieve product with ID ${productId}:`, error);
    throw error;
  }
}

/**
 * Update an existing product by ID
 * @param {string} productId - ID of the product to update
 * @param {Object} updateData - Data to update the product with
 * @returns {Object} The updated product object
 */
async function updateProduct(productId, updateData) {
  const shopifyClient = initializeShopifyClient();
  try {
    const response = await shopifyClient.put({
      path: `products/${productId}.json`,
      data: { product: updateData },
      //   type: shopify.clients.Rest.DataType.JSON, // Updated line
    });
    console.log("Product updated successfully:", response.body);
    return response.body.product;
  } catch (error) {
    console.error(`Failed to update product with ID ${productId}:`, error);
    throw error;
  }
}

/**
 * Delete a product by ID
 * @param {string} productId - ID of the product to delete
 * @returns {boolean} True if the product was deleted successfully
 */
async function deleteProduct(productId) {
  const shopifyClient = initializeShopifyClient();
  try {
    await shopifyClient.delete({
      path: `products/${productId}.json`,
    });
    console.log(`Product with ID ${productId} deleted successfully.`);
    return true;
  } catch (error) {
    console.error(`Failed to delete product with ID ${productId}:`, error);
    throw error;
  }
}

/**
 * Get a list of all products (paginated)
 * @param {number} limit - Number of products to retrieve per page
 * @param {number} page - The page number to retrieve (optional)
 * @returns {Array<Object>} List of products
 */
async function getAllProducts(limit = 10) {
  const shopifyClient = initializeShopifyClient();
  let products = [];
  let nextPageInfo = {};

  try {
    do {
      const response = await shopifyClient.get({
        path: "products.json",
        query: { limit, page_info: nextPageInfo },
      });
      console.log("response.body", response.body);

      products = products.concat(response.body.products);
      nextPageInfo = response.pageInfo?.nextPage?.query?.page_info;
    } while (nextPageInfo);

    console.log("Products retrieved successfully:", products);
    return products;
  } catch (error) {
    console.error("Failed to retrieve products:", error);
    throw error;
  }
}

/**
 * Update the images of a product
 * @param {string} productId - ID of the product to update
 * @param {Array<string>} imageFilenames - List of image filenames in the static/output-images directory
 * @returns {Object} The updated product object with new images
 */
async function updateProductImages(productId, imageFilenames) {
  const shopifyClient = initializeShopifyClient();
  try {
    const imageObjects = imageFilenames.map((filename) => {
      const filePath = path.join(__dirname, "static/output-images", filename);
      const imageData = fs.readFileSync(filePath, { encoding: "base64" });
      return { attachment: imageData };
    });

    const response = await shopifyClient.post({
      path: `products/${productId}/images.json`,
      data: { images: imageObjects },
      //   type: shopify.clients.Rest.DataType.JSON, // Updated line
    });

    console.log("Product images updated successfully:", response.body);
    return response.body;
  } catch (error) {
    console.error(
      `Failed to update images for product with ID ${productId}:`,
      error
    );
    throw error;
  }
}

export {
  createProduct,
  getProductById,
  updateProduct,
  deleteProduct,
  getAllProducts,
  updateProductImages,
};
