import {
  angularOutputTarget,
  ValueAccessorConfig,
} from '@stencil/angular-output-target';
import { Config } from '@stencil/core';
import { reactOutputTarget } from '@stencil/react-output-target';

const angularValueAccessorBindings: ValueAccessorConfig[] = [];

export const config: Config = {
  namespace: 'network-chart',
  taskQueue: 'async',
  outputTargets: [
    {
      type: 'dist',
      esmLoaderPath: '../loader',
      dir: '../../../dist/libs/stencil/network-chart/dist',
    },
    {
      type: 'www',
      dir: '../../../dist/libs/stencil/network-chart/www',
      serviceWorker: null, // disable service workers
    },
    {
      type: 'docs-readme',
      strict: true,
      footer: '',
    },

    angularOutputTarget({
      componentCorePackage: '@gramener/network-chart',
      directivesProxyFile:
        '../../../../libs/angular/network-chart/src/generated/directives/proxies.ts',
      valueAccessorConfigs: angularValueAccessorBindings,
    }),

    reactOutputTarget({
      componentCorePackage: '@gramener/network-chart',
      proxiesFile:
        '../../../../libs/react/network-chart/src/generated/components.ts',
      includeDefineCustomElements: true,
    }),
  ],
};
