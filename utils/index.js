import fs from "fs";
import path from "path";

/**
 * Writes the provided JSON data to a file at the specified path.
 * @param {Object} jsonData - The JSON data to write to the file.
 * @param {string} filePath - The path where the JSON file will be written.
 */
export const writeJsonToFile = (jsonData, filePath) => {
  const dir = path.dirname(filePath);

  // Ensure the directory exists
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // Write the JSON data to the file
  fs.writeFileSync(filePath, JSON.stringify(jsonData, null, 2), {
    encoding: "utf-8",
    flag: "w",
  });
};

// Example usage
const exampleJsonData = {
  products: [
    {
      id: "001",
      title: "Lemons",
      price: 10.99,
    },
    {
      id: "002",
      title: "Oranges",
      price: 12.99,
    },
  ],
};

const filePath = "./static/data/products.json";
writeJsonToFile(exampleJsonData, filePath);
