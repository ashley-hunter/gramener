import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

defineCustomElements(window);

import { defineCustomElements } from '@gramener/network-chart/loader';

@NgModule({
  imports: [CommonModule],
})
export class NetworkChartModule {}
