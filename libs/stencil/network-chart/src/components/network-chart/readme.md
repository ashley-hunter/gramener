# gramener-network-chart



<!-- Auto Generated Below -->


## Properties

| Property                | Attribute                 | Description                                                                                                | Type                                                        | Default                    |
| ----------------------- | ------------------------- | ---------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- | -------------------------- |
| `collide`               | `collide`                 | If true, don't allow nodes to overlap. If set to a number, provide a padding between nodes. Default: false | `number`                                                    | `0`                        |
| `data`                  | --                        | The data to display in the chart.                                                                          | `{ nodes: NetworkChartNode[]; links: NetworkChartLink[]; }` | `{ links: [], nodes: [] }` |
| `dragAction`            | `drag-action`             | Default: pin                                                                                               | `string`                                                    | `'pin'`                    |
| `height`                | `height`                  | Chart height in pixels. Default: 500                                                                       | `number`                                                    | `500`                      |
| `label`                 | `label`                   | Show labels? `labels="false"` hides all labels. Default: true                                              | `boolean`                                                   | `true`                     |
| `labelDominantBaseline` | `label-dominant-baseline` | `hanging` for top aligned, `alphabetic` for bottom-aligned,  `middle` for centered. Default: middle        | `string`                                                    | `'middle'`                 |
| `labelDx`               | `label-dx`                | Shift label right in pixels. -ve values to shift left. Default: 0                                          | `((d: SimulationNodeDatum) => number) \| number`            | `0`                        |
| `labelDy`               | `label-dy`                | Shift label down in pixels. -ve values to shift up. Default: 0                                             | `((d: SimulationNodeDatum) => number) \| number`            | `0`                        |
| `labelFill`             | `label-fill`              | Label font color. Default: black                                                                           | `string`                                                    | `'black'`                  |
| `labelFontFamily`       | `label-font-family`       | Label font name, e.g. `Roboto`. Default: sans-serif                                                        | `string`                                                    | `'sans-serif'`             |
| `labelFontSize`         | `label-font-size`         | Label font size in pixels. Default: 12                                                                     | `number`                                                    | `12`                       |
| `labelFontWeight`       | `label-font-weight`       | Label font weight, e.g. "bold" or "". Default: bold                                                        | `string`                                                    | `'bold'`                   |
| `labelText`             | `label-text`              | Text to show in label. Default: None                                                                       | `((d: SimulationNodeDatum) => string) \| string`            | `''`                       |
| `labelTextAnchor`       | `label-text-anchor`       | `start` for left aligned, `end` for right-aligned, `middle` for centered. Default: middle                  | `string`                                                    | `'middle'`                 |
| `link`                  | `link`                    | Show links? `links="false"` hides all links. Default: true                                                 | `boolean`                                                   | `true`                     |
| `linkDistance`          | `link-distance`           | Default distance between nodes. Default: 30                                                                | `number`                                                    | `30`                       |
| `linkId`                | `link-id`                 | TODO: document this. Default: None                                                                         | `string`                                                    | `''`                       |
| `linkOpacity`           | `link-opacity`            | Use 0.0 for transparent links, 1.0 for opaque links. Default: 0.6                                          | `number`                                                    | `0.6`                      |
| `linkStroke`            | `link-stroke`             | Line color of the links. Default: #999                                                                     | `string`                                                    | `'#999'`                   |
| `linkStrokeWidth`       | `link-stroke-width`       | Thickness of the links in pixels. Default: 1                                                               | `number`                                                    | `1`                        |
| `node`                  | `node`                    | Show nodes? `node="false"` hides all nodes. Default: true                                                  | `boolean`                                                   | `true`                     |
| `nodeCharge`            | `node-charge`             | How strongly nodes push each other. -ve values make nodes pull each other. Default: +30                    | `number`                                                    | `30`                       |
| `nodeFill`              | `node-fill`               | Color of the node circles. Default: red                                                                    | `((node: SimulationNodeDatum) => string) \| string`         | `'red'`                    |
| `nodeOpacity`           | `node-opacity`            | Use 0.0 for transparent nodes, 1.0 for opaque nodes. Default: 1                                            | `number`                                                    | `1`                        |
| `nodeSize`              | --                        | Radius of node circles in pixels. Default: 5                                                               | `(node: SimulationNodeDatum) => number`                     | `() => 5`                  |
| `nodeStroke`            | `node-stroke`             | Outline color of the node circles. Default: #fff                                                           | `((node: SimulationNodeDatum) => string) \| string`         | `'#fff'`                   |
| `nodeStrokeWidth`       | `node-stroke-width`       | Thickness of the node circles in pixels. Default: 1                                                        | `number`                                                    | `1`                        |
| `type`                  | `type`                    | The type of chart                                                                                          | `string`                                                    | `'node-link'`              |
| `width`                 | `width`                   | Chart width in pixels. Default: 500                                                                        | `number`                                                    | `500`                      |


----------------------------------------------


