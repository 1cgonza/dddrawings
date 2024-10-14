import { defineCollection, z } from 'astro:content';

const paginas = defineCollection({
  type: 'content',
  schema: z.object({
    draft: z.boolean().optional(),
    title: z.string(),
    description: z.string(),
  }),
});

const datasets = defineCollection({
  type: 'content',
  schema: z.object({
    draft: z.boolean().optional(),
    title: z.string(),
    tagLink: z.string(),
    sourceURL: z.string().url().optional(),
    parsedURL: z.string().url(),
    date: z.date(),
    description: z.string(),
    related: z
      .array(
        z.object({
          title: z.string(),
          slug: z.string(),
          tags: z.array(z.string()),
          year: z.number(),
        })
      )
      .optional(),
  }),
});

const lab = defineCollection({
  type: 'content',
  schema: z.object({
    draft: z.boolean().optional(),
    title: z.string(),
    date: z.date(),
    description: z.string(),
    descriptionLong: z.string().optional(),
    imgName: z.string().optional(),
    tags: z.array(z.string()),
    categories: z.array(z.string()).optional(),
  }),
});

const notations = defineCollection({
  type: 'content',
  schema: z.object({
    draft: z.boolean().optional(),
    title: z.string(),
    interactive: z.boolean().optional(),
    inverted: z.boolean().optional(),
    director: z.string(),
    year: z.number(),
    date: z.date(),
    description: z.string(),
    descriptionLong: z.string().optional(),
    imgName: z.string().optional(),
    poster: z.string().optional(),
    videos: z
      .object({ mp4: z.string().optional(), webm: z.string().optional(), ogg: z.string().optional() })
      .optional(),
  }),
});

export const collections = {
  datasets,
  lab,
  notations,
  paginas,
};
