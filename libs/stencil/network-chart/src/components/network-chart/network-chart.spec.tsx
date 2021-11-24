import { newSpecPage } from '@stencil/core/testing';
import { NetworkChart } from './network-chart';

describe('network-chart', () => {
  it('renders', async () => {
    const { root } = await newSpecPage({
      components: [NetworkChart],
      html: '<gramener-network-chart></gramener-network-chart>',
    });
    expect(root).toEqualHtml(`
      <gramener-network-chart>
        <mock:shadow-root>
          <div>Hello, World!</div>
        </mock:shadow-root>
      </gramener-network-chart>
    `);
  });
});
