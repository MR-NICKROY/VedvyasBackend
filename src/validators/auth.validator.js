const { z } = require('zod');

const signupSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required').trim(),
    email: z.string().email('Invalid email address').trim().toLowerCase(),
    phone: z.string().min(10, 'Valid phone number is required'),
    password: z.string().min(6, 'Password must be at least 6 characters long'),
  }),
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address').trim().toLowerCase(),
    password: z.string().min(1, 'Password is required'),
  }),
});
const adminSignupSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required').trim(),
    email: z.string().email('Invalid email address').trim().toLowerCase(),
    phone: z.string().min(10, 'Valid phone number is required'),
    password: z.string().min(6, 'Password must be at least 6 characters long'),
    adminSecret: z.string().min(1, 'Admin secret is required'),
  }),
});

module.exports = {
  signupSchema,
  loginSchema,
  adminSignupSchema
};
