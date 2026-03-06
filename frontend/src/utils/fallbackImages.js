/**
 * Fallback images related to North East Indian Agriculture
 * Used when images fail to load
 */

export const FALLBACK_IMAGES = {
  // General farm produce
  general: [
    "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg", // Fresh vegetables
    "https://images.pexels.com/photos/2255935/pexels-photo-2255935.jpeg", // Farm produce basket
    "https://images.pexels.com/photos/1090638/pexels-photo-1090638.jpeg", // Green vegetables
    "https://images.pexels.com/photos/1132558/pexels-photo-1132558.jpeg", // Fresh produce
    "https://images.pexels.com/photos/2692114/pexels-photo-2692114.jpeg", // Organic vegetables
  ],

  // Rice & Grains
  rice: [
    "https://images.pexels.com/photos/247599/pexels-photo-247599.jpeg", // Rice field
    "https://images.pexels.com/photos/1694075/pexels-photo-1694075.jpeg", // Rice
    "https://images.pexels.com/photos/1395323/pexels-photo-1395323.jpeg", // Rice grains
  ],

  // Spices (Ginger, Turmeric, Chillies)
  spices: [
    "https://images.pexels.com/photos/4021775/pexels-photo-4021775.jpeg", // Ginger
    "https://images.pexels.com/photos/4198023/pexels-photo-4198023.jpeg", // Turmeric
    "https://images.pexels.com/photos/533360/pexels-photo-533360.jpeg", // Chillies
  ],

  // Fruits
  fruits: [
    "https://images.pexels.com/photos/5945740/pexels-photo-5945740.jpeg", // Pineapple
    "https://images.pexels.com/photos/5946082/pexels-photo-5946082.jpeg", // Bananas
    "https://images.pexels.com/photos/1132558/pexels-photo-1132558.jpeg", // Oranges/Fruits
    "https://images.pexels.com/photos/113396/pexels-photo-113396.jpeg", // Citrus
  ],

  // Vegetables
  vegetables: [
    "https://images.pexels.com/photos/1327838/pexels-photo-1327838.jpeg", // Tomatoes
    "https://images.pexels.com/photos/1435904/pexels-photo-1435904.jpeg", // Green beans
    "https://images.pexels.com/photos/1435907/pexels-photo-1435907.jpeg", // Cabbage
    "https://images.pexels.com/photos/2286776/pexels-photo-2286776.jpeg", // Potatoes
    "https://images.pexels.com/photos/1458694/pexels-photo-1458694.jpeg", // Cucumber
    "https://images.pexels.com/photos/2329440/pexels-photo-2329440.jpeg", // Spinach
    "https://images.pexels.com/photos/143133/pexels-photo-143133.jpeg", // Carrots
    "https://images.pexels.com/photos/65175/pexels-photo-65175.jpeg", // Green peas
  ],

  // Tea
  tea: [
    "https://images.pexels.com/photos/1508666/pexels-photo-1508666.jpeg", // Tea leaves
    "https://images.pexels.com/photos/189530/pexels-photo-189530.jpeg", // Tea plantation
  ],

  // Bamboo & Traditional
  bamboo: [
    "https://images.pexels.com/photos/1337825/pexels-photo-1337825.jpeg", // Bamboo shoots
    "https://images.pexels.com/photos/1448735/pexels-photo-1448735.jpeg", // Bamboo
  ],

  // Farm/Landscape
  farm: [
    "https://images.pexels.com/photos/4253312/pexels-photo-4253312.jpeg", // Farm landscape
    "https://images.pexels.com/photos/2886937/pexels-photo-2886937.jpeg", // Indian farm
    "https://images.pexels.com/photos/221012/pexels-photo-221012.jpeg", // Agricultural field
  ],
};

// Get a random fallback image based on crop type
export function getFallbackImage(cropName = "") {
  const name = (cropName || "").toLowerCase();

  // Match crop name to category
  if (name.includes("rice") || name.includes("organic rice")) {
    return getRandomImage(FALLBACK_IMAGES.rice);
  }
  if (name.includes("ginger")) {
    return getRandomImage(FALLBACK_IMAGES.spices);
  }
  if (name.includes("turmeric")) {
    return getRandomImage(FALLBACK_IMAGES.spices);
  }
  if (name.includes("chilli") || name.includes("chillies")) {
    return getRandomImage(FALLBACK_IMAGES.spices);
  }
  if (name.includes("pineapple") || name.includes("banana")) {
    return getRandomImage(FALLBACK_IMAGES.fruits);
  }
  if (name.includes("tea")) {
    return getRandomImage(FALLBACK_IMAGES.tea);
  }
  if (name.includes("bamboo")) {
    return getRandomImage(FALLBACK_IMAGES.bamboo);
  }
  if (
    name.includes("tomato") ||
    name.includes("cabbage") ||
    name.includes("carrot") ||
    name.includes("spinach") ||
    name.includes("bean") ||
    name.includes("pea") ||
    name.includes("cucumber") ||
    name.includes("potato") ||
    name.includes("eggplant")
  ) {
    return getRandomImage(FALLBACK_IMAGES.vegetables);
  }

  // Default to general farm produce
  return getRandomImage(FALLBACK_IMAGES.general);
}

// Get random image from array
function getRandomImage(imageArray) {
  if (!imageArray || imageArray.length === 0) {
    return FALLBACK_IMAGES.general[0];
  }
  const randomIndex = Math.floor(Math.random() * imageArray.length);
  return imageArray[randomIndex];
}

// Default fallback SVG as data URI (always works)
export const DEFAULT_FALLBACK =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%2322c55e'/%3E%3Ctext x='200' y='160' text-anchor='middle' fill='white' font-size='48'%3E%F0%9F%8C%BF%3C/text%3E%3Ctext x='200' y='200' text-anchor='middle' fill='white' font-size='14'%3ENorth East India%3C/text%3E%3C/svg%3E";

// Small fallback for cards
export const SMALL_FALLBACK =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%2322c55e'/%3E%3Ctext x='50' y='55' text-anchor='middle' fill='white' font-size='24'%3E%F0%9F%8C%BF%3C/text%3E%3C/svg%3E";

export default {
  FALLBACK_IMAGES,
  getFallbackImage,
  DEFAULT_FALLBACK,
  SMALL_FALLBACK,
};
