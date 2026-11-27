import { z } from "zod";

export const voucherSchema = z.object({
  items: z.array(z.object({
    productId: z.string().min(1),
    restaurantName: z.string().optional(),
    name: z.string().min(1),
    price: z.number().finite().nonnegative(),
    quantity: z.number().int().positive(),
  })).min(1),
  address: z.string().trim().min(1),
  phone: z.string().min(1),
  zoneName: z.string(),
  customerName: z.string(),
  paymentLabel: z.string().min(1),
  paidAt: z.iso.datetime(),
});

export type VoucherData = z.infer<typeof voucherSchema>;
