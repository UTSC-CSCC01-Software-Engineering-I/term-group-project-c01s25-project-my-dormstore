export interface Product {
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
} 

export interface Variant {
  id: number
  label: string    // "Blue Laundry Hamper"
  value: string    // "blue"
}