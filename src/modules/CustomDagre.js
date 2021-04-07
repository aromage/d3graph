/* eslint-disable quotes */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import dagreD3 from 'dagre-d3';
import * as d3 from 'd3';
import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css';

import ChildNode from '@/components/graph/ChildNode.vue';
import Tooltip from '@/components/graph/Tooltip.vue';
import Vue from 'vue';

class CustomDagre {
  constructor(
    element = null,
    dagreOption = { directed: true, multigraph: false, compound: true },
    graphOption = {
      rankdir: 'LR', // Graph 방향
      ranksep: 150,
      nodesep: 30,
      marginx: 40,
      marginy: 40,
    }
  ) {
    this.element = element;
    this.dagreOption = dagreOption;
    this.graphOption = graphOption;
    this.edgeInfo = [];
    this.count = 0;

    this.g = null;
    this.inner = null;
    this.svg = null;
  }

  /**
   * ! 추후에 로직 독립이 필요함. 여기에 node 데이터 세팅과 rendering이 동시에 들어가 있음
   * TODO 스타일 정보 추가 해야함
   * @param {*}} g
   * @param {*} nodes
   * @param {*} currentGroup
   * @param {*} selectedItems
   */
  _createGroupGraph(g, nodes, currentGroup, selectedItems, groupInfo) {
    if (currentGroup && currentGroup != '') {
      g.setNode('currentGroup', { label: currentGroup, clusterLabelPos: 'top', rx: 5, ry: 5 });
    }

    nodes.forEach((node) => {
      //선택된 아이템 아니면 return
      if (!selectedItems?.find((item) => item === node.name) && selectedItems) return;

      let nodeName = currentGroup === node.group ? node.name : node.group;
      let groupCount = groupInfo.find((group) => {
        return group.name === node.group;
      }).children.length;

      if (!g.node(nodeName)) {
        this._setNode(g, nodeName, groupCount, currentGroup === node.group);
      }

      node.destNode.forEach((dNode) => {
        if (!selectedItems?.find((item) => item === dNode.name) && selectedItems) return;
        let destName = currentGroup === dNode.group ? dNode.name : dNode.group;
        let destGroupCount = groupInfo.find((group) => {
          return group.name === dNode.group;
        }).children.length;

        if (g.node(destName)) {
          const destGroupEdge = g.edge(nodeName, destName);
          if (destGroupEdge) {
            this._setEdgeTooltipInfo(this.edgeInfo, nodeName + destName, dNode, {
              start: '[' + node.group + ']' + node.name,
              end: '[' + dNode.group + ']' + dNode.name,
            });
          } else {
            g.setEdge(nodeName, destName, this._createEdgeObject(dNode));
            this._setEdgeTooltipInfo(this.edgeInfo, nodeName + destName, dNode, {
              start: '[' + node.group + ']' + node.name,
              end: '[' + dNode.group + ']' + dNode.name,
            });
          }
        } else {
          this._setNode(g, destName, destGroupCount, currentGroup === dNode.group);

          g.setEdge(nodeName, destName, this._createEdgeObject(dNode));
          this._setEdgeTooltipInfo(this.edgeInfo, nodeName + destName, dNode, {
            start: '[' + node.group + ']' + node.name,
            end: '[' + dNode.group + ']' + dNode.name,
          });
        }
      });
    });
  }

  _setNode(g, nodeName, groupCount, isChild) {
    const style = isChild ? 'childNode' : 'groupNode';

    g.setNode(
      nodeName,
      this._createNodeObject({ name: nodeName, groupCount: groupCount, class: style, image: this.count++ })
    );

    if (isChild) g.setParent(nodeName, 'currentGroup');

    return nodeName;
  }

  //TODO 진짜 하드코딩 html 컴포넌트화 필요
  _createNodeObject(info) {
    //공통으로 빼야할 부분
    const childNode = Vue.extend(ChildNode);
    const component = new childNode({
      propsData: {
        info: info,
      },
    }).$mount();

    const html = component.$el;

    return {
      shape: 'circle',
      labelType: 'html',
      label: html,
      rx: 2,
      ry: 2,
      padding: 0,
      class: info.class,
    };
  }

  //TODO 진짜 하드코딩 html 컴포넌트화 필요
  _createEdgeObject(nodeInfo) {
    const className = nodeInfo.isRealTimeCommunication == 'O' ? 'realTimeEdge' : 'defaultEdge';
    const html =
      '<div class="label-container"><div class="label-content"> ' +
      nodeInfo.communicationMethod +
      '/' +
      nodeInfo.dataEncoding +
      ' </div>' +
      '<div class=label-content>' +
      nodeInfo.mainData +
      '</div></div>';

    return {
      labelType: 'html',
      label: html,
      class: className,
      labelpos: 'c',
      curve: d3.curveBasis,
      arrowheadStyle: 'fill: #469AE4;',
    };
  }

  _setEdgeTooltipInfo(edgeInfo, edgeId, node, route) {
    const found = edgeInfo.find((info) => {
      return info.edgeId === edgeId;
    });
    if (found) {
      found.nodes.push({ node: node, route: route });
    } else {
      edgeInfo.push({
        edgeId: edgeId,
        nodes: [{ node: node, route: route }],
      });
    }
  }

  //TODO 진짜 하드코딩 html 컴포넌트화 필요
  _setTooltip(inner, edgeInfo) {
    inner
      .selectAll('g.edgeLabel')
      .attr('title', function (v) {
        //여기서 뭐하지
      })
      .each(function (v) {
        const nodes = edgeInfo.find((info) => {
          return info.edgeId === v.v + v.w;
        }).nodes;
        //공통으로 빼야할 부분
        const toolTip = Vue.extend(Tooltip);
        const component = new toolTip({
          propsData: {
            data: nodes,
          },
        }).$mount();
        const content = component.$el;

        tippy(this, {
          content: content,
          interactive: true,
          allowHTML: true,
          appendTo: document.body,
        });
      });
  }

  _centerGraph(g, inner, svg) {
    // Center the graph
    const xCenterOffset = (svg.attr('width') - g.graph().width) / 2;
    inner.attr('transform', 'translate(' + xCenterOffset + ', 20)');
    svg.attr('height', g.graph().height + 200);
  }

  render(nodes, currentGroup, selectedItems = null, groupInfo) {
    if (!nodes) return null;

    this.edgeInfo = [];
    this.count = 0;

    document.querySelector(this.element + ' > g > * ')?.remove();

    const g = new dagreD3.graphlib.Graph(this.dagreOption).setGraph(this.graphOption);

    this._createGroupGraph(g, nodes, currentGroup, selectedItems, groupInfo);

    //svg 세팅
    this.svg = d3.select(this.element);
    //inner 세팅
    this.inner = this.svg.append('g');
    //zoom 세팅
    const zoom = d3
      .zoom()
      // 더블클릭 줌 없애기
      .filter(() => {
        return !d3.event.button && d3.event.type != 'dblclick';
      })
      .on('zoom', () => {
        this.inner.attr('transform', d3.event.transform);
      });
    this.svg.call(zoom);

    //render하는 법
    const render = new dagreD3.render();
    render(this.inner, g);

    this._setTooltip(this.inner, this.edgeInfo);
    return g;
  }

  setEventNode(trigger, eventFunction) {
    this.inner.selectAll('g.node').on(trigger, eventFunction);
  }
}

export { CustomDagre };
