export interface Category {
  id: number;
  slug: string;
  name: string;
  icon: string;
  blurb: string;
  sort: number;
}

export interface Product {
  id: number;
  slug: string;
  name: string;
  nameEn: string;
  price: number;
  oldPrice: number | null;
  categoryId: number;
  categorySlug: string;
  categoryName: string;
  shortDesc: string;
  description: string;
  features: string[];
  variants: string[];
  images: string[];
  stock: number;
  prepTime: string;
  material: string;
  featured: boolean;
}

export interface InstaPost {
  src: string;
  caption: string;
  ratio: string;
}
