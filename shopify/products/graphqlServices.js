import dotenv from "dotenv";
dotenv.config();
import "@shopify/shopify-api/adapters/node";
import { shopifyApi } from "@shopify/shopify-api";
import {
  CREATE_PRODUCT_MUTATION,
  GET_PRODUCT_QUERY,
  UPDATE_PRODUCT_MUTATION,
  DELETE_PRODUCT_MUTATION,
} from "./graphql/queries.js";

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
 * @returns {object} Shopify GraphQL client
 */
function initializeShopifyClient() {
  return new shopify.clients.Graphql({ session: session });
}

/**
 * Create a new product on Shopify
 * @param {Object} productData - Product data to create
 * @returns {Object} The created product object
 */
async function createProduct(productData) {
  const shopifyClient = initializeShopifyClient();
  try {
    const response = await shopifyClient.query({
      data: {
        query: CREATE_PRODUCT_MUTATION,
        variables: { input: productData },
      },
    });
    console.log(
      "Product created successfully:",
      response.body.data.productCreate.product
    );
    return response.body.data.productCreate.product;
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
    const response = await shopifyClient.query({
      data: {
        query: GET_PRODUCT_QUERY,
        variables: { id: `gid://shopify/Product/${productId}` },
      },
    });
    console.log("Product retrieved successfully:", response.body.data.product);
    return response.body.data.product;
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
    const response = await shopifyClient.query({
      data: {
        query: UPDATE_PRODUCT_MUTATION,
        variables: {
          id: `gid://shopify/Product/${productId}`,
          input: updateData,
        },
      },
    });
    console.log(
      "Product updated successfully:",
      response.body.data.productUpdate.product
    );
    return response.body.data.productUpdate.product;
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
    const response = await shopifyClient.query({
      data: {
        query: DELETE_PRODUCT_MUTATION,
        variables: { id: `gid://shopify/Product/${productId}` },
      },
    });
    console.log(`Product with ID ${productId} deleted successfully.`);
    return true;
  } catch (error) {
    console.error(`Failed to delete product with ID ${productId}:`, error);
    throw error;
  }
}

export { createProduct, getProductById, updateProduct, deleteProduct };
