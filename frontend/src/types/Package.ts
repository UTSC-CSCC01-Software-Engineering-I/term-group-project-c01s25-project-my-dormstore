export interface Package {
  id: number;
  name: string;
  price: number;
  category?: string;
  image?: string;
  description: string;
  rating: number;
  variant?: Variant[];
  included?: string[];
  created_at?: string;
  updated_at?: string;
  suggestedWithPurchase?: boolean;
  shippingInfo?: string;
  image_url?: string;
  size?: string; // Available sizes (comma-separated)
  color?: string; // Available colors (comma-separated)
  inventory?: number; // Available stock quantity
}

export interface Variant {
  id: number
  label: string    // "Blue Laundry Hamper"
  value: string    // "blue"
}