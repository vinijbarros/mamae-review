import { Timestamp } from 'firebase/firestore';

export interface Review {
  id: string;
  productId: string;
  rating: number;
  comment: string;
  authorId: string;
  authorName: string;
  createdAt: Timestamp | Date;
}

export type ReviewInput = Omit<Review, 'id' | 'createdAt'>;

export type ReviewSortBy = 'recent' | 'rating';

