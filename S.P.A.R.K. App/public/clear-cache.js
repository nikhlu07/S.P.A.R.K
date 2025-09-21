// Cache busting script - run this in browser console to clear image cache
if (typeof window !== 'undefined') {
  // Clear all cached images
  const images = document.querySelectorAll('img');
  images.forEach(img => {
    if (img.src.includes('placeholder')) {
      const url = new URL(img.src);
      url.searchParams.set('v', Date.now());
      img.src = url.toString();
    }
  });
  
  console.log('Image cache cleared! All placeholder images refreshed.');
}
