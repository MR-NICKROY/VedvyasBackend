const { z } = require('zod');

const shippingAddressSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  phone: z.string().min(10, 'Phone number is required'),
  email: z.string().email('Invalid email address').optional(),
  street: z.string().min(1, 'Street address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  zipCode: z.string().regex(/^[0-9]{6}$/, 'Invalid PIN code')
});

const createOrderSchema = z.object({
  body: z.object({
    products: z.array(z.object({
      productId: z.union([z.string().min(1), z.number()]),
      quantity: z.number().int().min(1, 'Quantity must be at least 1'),
      priceAtPurchase: z.number().positive(),
    })).min(1, 'Order must contain at least one product'),
    totalAmount: z.number().positive(),
    shippingAddress: shippingAddressSchema.optional(),
    paymentMethod: z.enum(['COD', 'RAZORPAY']).optional(),
    paymentDetails: z.object({
      razorpayOrderId: z.string().min(1),
      razorpayPaymentId: z.string().min(1),
      razorpaySignature: z.string().min(1)
    }).optional(),
  }),
});

module.exports = {
  createOrderSchema
};
