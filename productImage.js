import { createCanvas, loadImage } from "canvas";
import sharp from "sharp";
import BezierEasing from "bezier-easing";
import fs from "fs";
import path from "path";

// Function to create the gradient background
function createGradient(ctx, width, height) {
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, "white");
  gradient.addColorStop(1, "lightgray");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
}

// Function to generate custom box shadows
const getBoxShadows = (numShadowLayers, options = {}) => {
  const {
    angle = 40,
    length = 150,
    finalBlur = 100,
    spread = 0,
    finalTransparency = 0.2,
  } = options;

  const angleToRadians = (angle) => angle * (Math.PI / 180);
  const rgba = (r, g, b, a) => `rgba(${r}, ${g}, ${b}, ${a})`;

  const shadow = (left, top, blur, spread, color) =>
    `${left}px ${top}px ${blur}px ${spread}px ${color}`;

  let alphaEasingValue = [0.1, 0.5, 0.9, 0.5];
  let offsetEasingValue = [0.7, 0.1, 0.9, 0.3];
  let blurEasingValue = [0.7, 0.1, 0.9, 0.3];

  const alphaEasing = BezierEasing(...alphaEasingValue);
  const offsetEasing = BezierEasing(...offsetEasingValue);
  const blurEasing = BezierEasing(...blurEasingValue);

  let easedAlphaValues = [];
  let easedOffsetValues = [];
  let easedBlurValues = [];

  for (let i = 1; i <= numShadowLayers; i++) {
    const fraction = i / numShadowLayers;
    easedAlphaValues.push(alphaEasing(fraction));
    easedOffsetValues.push(offsetEasing(fraction));
    easedBlurValues.push(blurEasing(fraction));
  }

  let boxShadowValues = [];
  for (let i = 0; i < numShadowLayers; i++) {
    let yOffset =
      easedOffsetValues[i] * Math.cos(angleToRadians(angle)) * length;
    let xOffset =
      easedOffsetValues[i] * Math.sin(angleToRadians(angle)) * length;

    boxShadowValues.push([
      xOffset,
      yOffset,
      easedBlurValues[i] * finalBlur,
      spread,
      easedAlphaValues[i] * finalTransparency,
    ]);
  }

  const shadowString = boxShadowValues
    .map(([leftOffset, topOffset, blur, spread, alpha]) =>
      shadow(leftOffset, topOffset, blur, spread, rgba(0, 0, 0, alpha))
    )
    .join(",\n");

  return shadowString;
};

// Function to add custom layered drop shadow
function addLayeredDropShadow(ctx, x, y, width, height, layers) {
  const shadows = getBoxShadows(layers, {
    angle: 40,
    length: 150,
    finalBlur: 300,
    spread: 0,
    finalTransparency: 0.2,
  });

  ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
  ctx.shadowBlur = 20;
  ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
  ctx.fillRect(x, y, width, height);

  // Add the layered shadows (this is a visual representation, not the CSS)
  ctx.shadowOffsetX = 10;
  ctx.shadowOffsetY = 10;
  ctx.shadowBlur = 10;
}

// Function to generate product images with size control
async function generateProductImage(artworkFilename, format = "webp") {
  const canvasSize = 2048;
  const maxFileSize = 19 * 1024 * 1024; // 19 MB in bytes

  // Define input and output directories
  const inputDir = path.join(__dirname, "input-images");
  const outputDir = path.join(__dirname, "output-images");

  const artworkPath = path.join(inputDir, artworkFilename);
  const outputPath = path.join(
    outputDir,
    `${path.basename(artworkFilename, path.extname(artworkFilename))}.${format}`
  );

  // Create directories if they don't exist
  if (!fs.existsSync(inputDir)) {
    fs.mkdirSync(inputDir);
  }
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }

  const canvas = createCanvas(canvasSize, canvasSize);
  const ctx = canvas.getContext("2d");

  // Create background gradient
  createGradient(ctx, canvasSize, canvasSize);

  // Load the artwork image
  const image = await loadImage(artworkPath);

  // Calculate artwork size and position (90% of the canvas size)
  const maxArtworkWidth = canvasSize * 0.8;
  const maxArtworkHeight = canvasSize * 0.8;
  const aspectRatio = image.width / image.height;

  let artworkWidth = maxArtworkWidth;
  let artworkHeight = artworkWidth / aspectRatio;

  if (artworkHeight > maxArtworkHeight) {
    artworkHeight = maxArtworkHeight;
    artworkWidth = artworkHeight * aspectRatio;
  }

  const offsetX = (canvasSize - artworkWidth) / 2;
  const offsetY = (canvasSize - artworkHeight) / 2;

  // Add custom layered drop shadow
  addLayeredDropShadow(ctx, offsetX, offsetY, artworkWidth, artworkHeight, 7);

  // Draw the artwork image on top of the shadow
  ctx.drawImage(image, offsetX, offsetY, artworkWidth, artworkHeight);

  // Convert canvas to PNG buffer
  const buffer = canvas.toBuffer("image/png");

  // Start with a high quality and reduce if needed
  let quality = 100;
  let fileSize = Infinity;

  // Loop to reduce quality if file exceeds maxFileSize
  while (fileSize > maxFileSize && quality > 10) {
    const outputBuffer = await sharp(buffer)
      .toFormat(format, { quality }) // Reduce quality gradually
      .toBuffer();

    fileSize = outputBuffer.length;

    // If the file is still larger than 19MB, reduce quality
    if (fileSize > maxFileSize) {
      quality -= 10; // Decrease quality by 10% each time
    } else {
      // Write the output file once it meets the file size criteria
      await sharp(outputBuffer).toFile(outputPath);
      console.log(`Optimized image saved at: ${outputPath}`);
      console.log(`File size: ${(fileSize / (1024 * 1024)).toFixed(2)} MB`);
      return;
    }
  }

  // If quality falls below 10 and still exceeds file size
  if (fileSize > maxFileSize) {
    console.warn(
      "The image quality is too high to fit the 19 MB limit. Consider reducing dimensions."
    );
  }
}

// Example usage
const artworkFilename = "being-nature.jpg"; // Replace with your input image filename
generateProductImage(artworkFilename, "jpg") // 'webp' or 'jpeg' for format
  .then(() => console.log("Product image created and optimized successfully!"))
  .catch((err) => console.error(err));
