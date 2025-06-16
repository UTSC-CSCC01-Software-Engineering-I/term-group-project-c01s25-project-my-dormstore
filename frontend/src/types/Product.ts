export interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  description: string;
  rating: number;
  variant?: Variant[];
  included?: string[];
} 

export interface Variant {
  id: number
  label: string    // "Blue Laundry Hamper"
  value: string    // "blue"
}