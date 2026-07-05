// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { satteri } from '@astrojs/markdown-satteri';

/**
 * Wrap every Markdown-generated <table> in <div class="table-scroll"> so wide
 * tables scroll inside their own container instead of overflowing the page
 * on mobile (styled in global.css under `.essay-body .table-scroll`).
 */
const tableScrollPlugin = {
  name: 'table-scroll',
  element: {
    filter: ['table'],
    /**
     * @param {any} node
     * @param {any} ctx
     */
    visit(node, ctx) {
      const parent = ctx.parent(node);
      const alreadyWrapped =
        parent &&
        parent.type === 'element' &&
        parent.tagName === 'div' &&
        Array.isArray(parent.properties?.className) &&
        parent.properties.className.includes('table-scroll');
      if (alreadyWrapped) return;
      ctx.wrapNode(node, {
        type: 'element',
        tagName: 'div',
        properties: { className: ['table-scroll'] },
        children: [],
      });
    },
  },
};

// https://astro.build/config
export default defineConfig({
  site: 'https://muscatazzopardi.com',
  integrations: [sitemap()],
  markdown: {
    processor: satteri({ hastPlugins: [tableScrollPlugin] }),
  },
});
