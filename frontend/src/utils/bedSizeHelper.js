import { DormChecklistItems } from '../data/dormChecklistItems';

// Extract bed size from dorm checklist data
export const getBedSizeForDorm = (dormName) => {
  if (!dormName || !DormChecklistItems[dormName]) {
    return null;
  }
  
  // Find the first item that mentions "sheet"
  const sheetItem = DormChecklistItems[dormName].find(item => 
    item.label && item.label.toLowerCase().includes('sheet')
  );
  
  if (!sheetItem) {
    return null;
  }
  
  // Extract size from the sheet label
  const label = sheetItem.label.toLowerCase();
  
  if (label.includes('twin xl')) return 'Twin XL';
  if (label.includes('double xl')) return 'Double XL';
  if (label.includes('twin')) return 'Twin';
  if (label.includes('double')) return 'Double';
  if (label.includes('queen')) return 'Queen';
  if (label.includes('king')) return 'King';
  
  return null;
};

// Get current user's bed size
export const getCurrentUserBedSize = () => {
  try {
    const email = localStorage.getItem("userEmail");
    if (!email) return null;
    
    const userInfo = localStorage.getItem(`userInfo_${email}`);
    if (!userInfo) return null;
    
    const parsed = JSON.parse(userInfo);
    return getBedSizeForDorm(parsed.dorm);
  } catch (error) {
    console.error('Error getting user bed size:', error);
    return null;
  }
};

// Convert dormChecklistItems to show what user should get for their dorm
export const getRecommendationsForDorm = (dormName) => {
  const bedSize = getBedSizeForDorm(dormName);
  const dormItems = DormChecklistItems[dormName] || [];
  
  return {
    bedSize,
    dormName,
    items: dormItems,
    hasSpecificBedSize: !!bedSize
  };
};

// Get all available bed sizes from the checklist data
export const getAllBedSizes = () => {
  const sizes = new Set();
  
  Object.values(DormChecklistItems).forEach(items => {
    items.forEach(item => {
      if (item.label && item.label.toLowerCase().includes('sheet')) {
        const size = getBedSizeForDorm(Object.keys(DormChecklistItems).find(
          key => DormChecklistItems[key] === items
        ));
        if (size) sizes.add(size);
      }
    });
  });
  
  return Array.from(sizes).sort();
}; 