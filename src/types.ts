export interface Confession {
  id: number;
  text: string;
  likes: number;
  category: string;
  createdAt: string;
}

export interface Stats {
  totalConfessions: number;
  topLiked: Confession[];
}
