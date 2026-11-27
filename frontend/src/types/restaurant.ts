type Zone = {
  id: string;
  name: string;
};

export type ZoneDetail = {
  id: string;
  name: string;
  comuna: number;
  distanceKm: number;
};
export type AllRestaurants = {
  id: string;
  name: string;
  category: string;
  isEco: boolean;
  description: string | null;
  imageUrl: string | null;
  tag: string | null;
  zone: Zone;
};

export type RestaurantListResponse = {
  data: AllRestaurants[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type RestaurantProduct = {
  id: string;
  name: string;
  category: string;
  price: number;
  available: boolean;
};

export type RestaurantDetail = AllRestaurants & {
  products: RestaurantProduct[];
};
