import dagreD3 from 'dagre-d3';
import * as d3 from 'd3';
import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css';

function renderer(elementId, dagreOption, graphOption) {
  const svg = d3.select(elementId);

  const g = new dagreD3.graphlib.Graph(dagreOption).setGraph(graphOption);
  const inner = svg.append('g');

  const zoom = _setZoom();
  svg.call(zoom);

  const _setZoom = function () {
    return (
      d3
        .zoom()
        // 더블클릭 줌 없애기
        .filter(() => {
          return !d3.event.button && d3.event.type != 'dblclick';
        })
        .on('zoom', () => {
          this.inner.attr('transform', d3.event.transform);
        })
    );
  };

  return {
    render: function () {
      document.querySelector(elementId + ' > g > * ')?.remove();
      const dagreRender = new dagreD3.render();
      dagreRender(inner, g);
      return {
        g: g,
        inner: inner,
      };
    },
    setEventNode(trigger, eventFunction) {
      inner.selectAll('g.node').on(trigger, eventFunction);
    },
    setEdgeTooltip(setContent) {
      inner
        .selectAll('g.edgeLabel')
        .attr('title', function (v) {
          //여기서 뭐하지
        })
        .each(function (v) {
          const content = setContent(v);
          tippy(this, {
            content: content,
            interactive: true,
            allowHTML: true,
            appendTo: document.body,
          });
        });
    },
  };
}
