// Flytt disse til en egen utils fil: imageUtils.js
export const MAX_IMAGE_SIZE = 800; // Maximum dimension (width or height) in pixels
export const JPEG_QUALITY = 0.7; // 0.7 er en god balanse mellom størrelse og kvalitet

export const compressImage = async (base64String) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let { width, height } = calculateDimensions(img.width, img.height);
      
      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      
      resolve(canvas.toDataURL('image/jpeg', JPEG_QUALITY));
    };
    img.onerror = reject;
    img.src = base64String;
  });
};

export const calculateDimensions = (originalWidth, originalHeight) => {
  let width = originalWidth;
  let height = originalHeight;
  
  if (width > height && width > MAX_IMAGE_SIZE) {
    height *= MAX_IMAGE_SIZE / width;
    width = MAX_IMAGE_SIZE;
  } else if (height > MAX_IMAGE_SIZE) {
    width *= MAX_IMAGE_SIZE / height;
    height = MAX_IMAGE_SIZE;
  }
  
  return { width, height };
};
