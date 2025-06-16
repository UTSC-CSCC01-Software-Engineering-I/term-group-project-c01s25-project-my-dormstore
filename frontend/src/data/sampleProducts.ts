import { Product } from '../types/Product';

export const sampleProducts: Product[] = [
  {
    id: 1,
    name: "Laundry Essentials",
    price: 44.99,
    image: "https://via.placeholder.com/300x200/f0f0f0/666?text=Kitchen+Package",
    description: "This package includes everything you will need for your clean and dirty laundry.",
    rating: 4,
    variant: [
      { id: 1, label: "Blue Laundry Hamper",  value: "blue" },
      { id: 2, label: "Red Laundry Hamper",   value: "red"  },
    ],
    included: [
      "4 Hangers",
      "Laundry Hamper",
      "Washing Bag",
      "Tide Detergent",
    ]
  },
  {
    id: 2,
    name: "Kitchen Package",
    price: 99.95,
    image: "https://via.placeholder.com/300x200/f0f0f0/666?text=Kitchen+Package",
    description: "Complete kitchen essentials for your dorm room",
    rating: 3.5
  },
  {
    id: 3,
    name: "Cleaning Package", 
    price: 39.99,
    image: "https://via.placeholder.com/300x200/f0f0f0/666?text=Cleaning+Package",
    description: "All the cleaning supplies you need for your dorm",
    rating: 4
  },
  {
    id: 4,
    name: "Household Package",
    price: 57.99,
    image: "https://via.placeholder.com/300x200/f0f0f0/666?text=Household+Package", 
    description: "Essential household items for dorm living",
    rating: 1
  },
  {
    id: 5,
    name: "Organization Package",
    price: 24.99,
    image: "https://via.placeholder.com/300x200/f0f0f0/666?text=Organization+Package",
    description: "Keep your dorm organized with these storage solutions",
    rating: 2
  },
  
  {
    id: 6,
    name: "xyz",
    price: 24.99,
    image: "https://via.placeholder.com/300x200/f0f0f0/666?text=Organization+Package",
    description: "Keep your dorm organized with these storage solutions",
    rating: -1
  }, 
  {
    id: 7,
    name: "xyz",
    price: 24.99,
    image: "https://via.placeholder.com/300x200/f0f0f0/666?text=Organization+Package",
    description: "Keep your dorm organized with these storage solutions",
    rating: -1
  },

  {
    id: 8,
    name: "xyz",
    price: 24.99,
    image: "https://via.placeholder.com/300x200/f0f0f0/666?text=Organization+Package",
    description: "Keep your dorm organized with these storage solutions",
    rating: -1
  }
  
]; 