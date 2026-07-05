import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context) {
  const writing = await getCollection('writing', ({ data }) => !data.draft);

  const items = writing.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());

  return rss({
    title: 'Richard Muscat Azzopardi',
    description: 'Essays on marketing, strategy, and running a good business.',
    site: context.site,
    items: items.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.date,
      link: `/writing/${post.id}/`,
    })),
    customData: `<language>en</language>`,
  });
}
