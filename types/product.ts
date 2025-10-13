import { Timestamp } from 'firebase/firestore';

export interface Product {
  id: string;
  name: string;
  category: string;
  description: string;
  rating: number;
  price: number;
  storeName: string;
  storeLink: string;
  imageUrl: string;
  createdBy: string;
  createdAt: Timestamp | Date;
}

export type ProductInput = Omit<Product, 'id' | 'createdAt'>;

export const PRODUCT_CATEGORIES = [
  'Alimentação',
  'Roupas e Acessórios',
  'Higiene e Cuidados',
  'Brinquedos',
  'Móveis e Decoração',
  'Transporte',
  'Amamentação',
  'Gestação',
  'Outros',
] as const;

export type ProductCategory = typeof PRODUCT_CATEGORIES[number];

