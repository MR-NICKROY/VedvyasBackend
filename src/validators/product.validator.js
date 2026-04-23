const { z } = require('zod');

// Sub-schemas for nested objects
const weightSchema = z.object({
  value: z.string().min(1, 'Weight value is required')
});

const descriptionDetailSchema = z.object({
  title: z.string().min(1, 'Detail title is required'),
  description: z.string().min(1, 'Detail description is required')
});

const nutritionalInfoSchema = z.object({
  name: z.string().min(1, 'Nutritional info name is required'),
  value: z.string().min(1, 'Nutritional info value is required')
});

const createProductSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Product title is required'),
    tags: z.string()
      .transform(str => JSON.parse(str))
      .pipe(z.array(z.string()).optional()),
    name: z.string().min(1, 'Product name is required'),
    slug: z.string().min(1, 'Slug is required'),
    description: z.string().min(1, 'Product description is required'),
    newPrice: z.preprocess(val => Number(val), z.number().positive('Price must be positive')),
    oldPrice: z.preprocess(val => val ? Number(val) : undefined, z.number().positive().optional()),
    weights: z.string()
      .transform(str => JSON.parse(str))
      .pipe(z.array(weightSchema).optional()),
    availableQuantity: z.preprocess(val => Number(val), z.number().min(0, 'Quantity cannot be negative')),
    descriptionDetails: z.string()
      .transform(str => JSON.parse(str))
      .pipe(z.array(descriptionDetailSchema).optional()),
    nutritionalInfo: z.string()
      .transform(str => JSON.parse(str))
      .pipe(z.array(nutritionalInfoSchema).optional()),
    ingredients: z.string()
      .transform(str => JSON.parse(str))
      .pipe(z.array(z.string()).optional()),
    healthBenefits: z.string()
      .transform(str => JSON.parse(str))
      .pipe(z.array(z.string()).optional()),
    howItsMade: z.string().optional(),
    isActive: z.preprocess(val => val !== undefined ? String(val) === 'true' : true, z.boolean().optional().default(true)),
  }),
});

const updateProductSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Object ID'),
  }),
  body: z.object({
    title: z.string().optional(),
    tags: z.string().transform(str => JSON.parse(str)).pipe(z.array(z.string()).optional()).optional(),
    name: z.string().optional(),
    slug: z.string().optional(),
    description: z.string().optional(),
    newPrice: z.preprocess(val => val ? Number(val) : undefined, z.number().positive().optional()),
    oldPrice: z.preprocess(val => val ? Number(val) : undefined, z.number().positive().optional()),
    weights: z.string().transform(str => JSON.parse(str)).pipe(z.array(weightSchema).optional()).optional(),
    availableQuantity: z.preprocess(val => val ? Number(val) : undefined, z.number().min(0).optional()),
    descriptionDetails: z.string().transform(str => JSON.parse(str)).pipe(z.array(descriptionDetailSchema).optional()).optional(),
    nutritionalInfo: z.string().transform(str => JSON.parse(str)).pipe(z.array(nutritionalInfoSchema).optional()).optional(),
    ingredients: z.string().transform(str => JSON.parse(str)).pipe(z.array(z.string()).optional()).optional(),
    healthBenefits: z.string().transform(str => JSON.parse(str)).pipe(z.array(z.string()).optional()).optional(),
    howItsMade: z.string().optional(),
    isActive: z.preprocess(val => val !== undefined ? String(val) === 'true' : undefined, z.boolean().optional()),
  }).passthrough(),
});

module.exports = {
  createProductSchema,
  updateProductSchema
};
