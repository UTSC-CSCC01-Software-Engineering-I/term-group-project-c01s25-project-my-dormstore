export interface Product {
  id: number;
  name: string;
  price: number;
  category?: string;
  image?: string;
  description: string;
  rating: number;
  size?: string; // Available sizes (comma-separated)
  color?: string; // Available colors (comma-separated)
  available_sizes?: string[];
  available_colors?: string[];
  variant?: Variant[];
  included?: string[];
  created_at?: string;
  updated_at?: string;
  suggestedWithPurchase?: boolean;
  shippingInfo?: string;
  image_url?: string; 
} 

export interface Variant {
  id: number
  label: string    // "Blue Laundry Hamper"
  value: string    // "blue"
}