import { getAllProducts, updateProductImages } from "./services.js";

const main = async () => {
  const products = await getAllProducts();
  console.log(products);
};

main();
