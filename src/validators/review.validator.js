const { z } = require('zod');

const addReviewSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Product ID is required'),
  }),
  body: z.object({
    rating: z.preprocess(val => Number(val), z.number().min(1).max(5)),
    title: z.string().trim().optional(),
    description: z.string().trim().optional(),
    stateName: z.string().trim().optional(),
    comment: z.string().trim().optional(),
  }).superRefine((data, ctx) => {
    if (!data.description && !data.comment) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['description'],
        message: 'Review comment is required',
      });
    }
  }),
});

module.exports = {
  addReviewSchema
};
