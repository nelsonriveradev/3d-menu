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
