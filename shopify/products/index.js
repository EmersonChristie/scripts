import {
  getAllProducts,
  updateProductImages,
  getProductById as getProductByIdRest,
} from "./services.js";
import {
  createProduct,
  getProductById as getProductByIdGraphql,
  updateProduct,
  deleteProduct,
} from "./graphqlServices.js";
import { writeJsonToFile } from "../../utils/index.js";

const main = async () => {
  // Get all products using REST API
  // const filePath = "./static/data/products.json";
  // const products = await getAllProducts();
  // writeJsonToFile(products, filePath);
  // console.log(products);

  // Get product by id using REST API
  //   const filePathRest = "./static/data/currProductRest.json";
  //   const productRest = await getProductByIdRest("8074394992832");
  //   writeJsonToFile(productRest, filePathRest);
  //   console.log(productRest);

  // Get product by id using GraphQL API
  const filePathGraphql = "./static/data/currProductGraphql.json";
  const productGraphql = await getProductByIdGraphql("8074394992832");
  writeJsonToFile(productGraphql, filePathGraphql);
  console.log(productGraphql);
};

main();
