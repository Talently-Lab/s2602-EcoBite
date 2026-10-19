export type AllRestaurants = {
  id?: string | number;
  name: string;
  description: string;
  imageSrc: string;
  tag: string;
  cuisine?: string;
  impact?: string;
  zone?: string;
  paymentMethods?: string[];
  discount?: boolean;
  isNew?: boolean;
};
