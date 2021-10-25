import { newSpecPage } from '@stencil/core/testing';
import { NetworkChart } from './network-chart';

describe('network-chart', () => {
  it('renders', async () => {
    const { root } = await newSpecPage({
      components: [NetworkChart],
      html: '<network-chart></network-chart>',
    });
    expect(root).toEqualHtml(`
      <network-chart>
        <mock:shadow-root>
          <div>Hello, World!</div>
        </mock:shadow-root>
      </network-chart>
    `);
  });
});
