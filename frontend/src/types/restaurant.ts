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
  isEco?: string;
  zone: Zone;
};

export type RestaurantProduct = {
  id: string;
  name: string;
  category: string;
  price: number;
  available: boolean;
};

export type RestaurantDetail = {
  id: string;
  name: string;
  category: string;
  isEco: boolean;
  zone: Zone;
  products: RestaurantProduct[];
};
