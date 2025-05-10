export type MenuItem = {
  id: string;
  name: string;
  price: number;
  category: string;
  createdAt: Date;
};

export type RestaurantData = {
  name: string;
  location: string;
  phoneNumber: number | null;
  logo: File;
};

export type Restaurant = {
  name: string;
  slug: string | null;
  location: string;
  phone: number | string;
  logo_url: string;
};
