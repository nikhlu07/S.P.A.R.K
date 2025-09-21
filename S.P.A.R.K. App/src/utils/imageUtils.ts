// Image utility functions for consistent image handling

export const getImageProps = (src: string, alt: string, className?: string) => {
  return {
    src,
    alt,
    className: `object-cover object-center ${className || ''}`,
    style: { 
      maxWidth: '100%', 
      maxHeight: '100%',
      display: 'block'
    },
    onError: (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
      // Fallback to a default image if the original fails to load
      e.currentTarget.src = "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&h=300&fit=crop";
    }
  };
};

export const getAvatarProps = (src: string, alt: string, className?: string) => {
  return {
    src,
    alt,
    className: `rounded-full object-cover object-center ${className || ''}`,
    style: { 
      maxWidth: '100%', 
      maxHeight: '100%',
      display: 'block'
    },
    onError: (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
      // Fallback to a default avatar if the original fails to load
      e.currentTarget.src = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face";
    }
  };
};

// Predefined image URLs with proper sizing
export const IMAGE_URLS = {
  DEFAULT_DEAL: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&h=300&fit=crop",
  DEFAULT_BUSINESS: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&h=300&fit=crop",
  DEFAULT_AVATAR: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
  PIZZA: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop",
  COFFEE: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&h=300&fit=crop",
  ELECTRONICS: "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=400&h=300&fit=crop",
  FASHION: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&h=300&fit=crop",
  BOOKS: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop"
};

// Get appropriate image based on deal title or category
export const getDealImage = (title: string, category: string, customImage?: string) => {
  if (customImage) return customImage;
  
  const lowerTitle = title.toLowerCase();
  const lowerCategory = category.toLowerCase();
  
  if (lowerTitle.includes('pizza') || lowerCategory.includes('food')) {
    return IMAGE_URLS.PIZZA;
  } else if (lowerTitle.includes('coffee') || lowerCategory.includes('beverage')) {
    return IMAGE_URLS.COFFEE;
  } else if (lowerTitle.includes('tech') || lowerTitle.includes('electronic') || lowerCategory.includes('technology')) {
    return IMAGE_URLS.ELECTRONICS;
  } else if (lowerTitle.includes('fashion') || lowerTitle.includes('clothing') || lowerCategory.includes('retail')) {
    return IMAGE_URLS.FASHION;
  } else if (lowerTitle.includes('book') || lowerCategory.includes('education')) {
    return IMAGE_URLS.BOOKS;
  }
  
  return IMAGE_URLS.DEFAULT_DEAL;
};
