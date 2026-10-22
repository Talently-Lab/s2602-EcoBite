type Zone = {
  id: string;
  name: string;
};
export type AllRestaurants = {
  id: string;
  name: string;
  category: string;
  isEco?: string;
  zone: Zone;
};
