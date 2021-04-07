<template>
  <div id="svg-container">
    <svg id="svg" width="100%" height="100vh"></svg>
  </div>
</template>
<script>
import Vue from 'vue';
// import ChildNode from '@/components/graph/ChildNode.vue';
// import Tooltip from '@/components/graph/Tooltip.vue';
// import Edge from '@/components/graph/Edge.vue';

export default {
  mounted() {
    //흠
  },
  props: {
    dagreOption: {
      default: {
        directed: true,
        multigraph: false,
        compound: true,
      },
    },
    graphOption: {
      default: {
        rankdir: 'LR', // Graph 방향
        ranksep: 150,
        nodesep: 30,
        marginx: 40,
        marginy: 40,
      },
    },
  },
  data() {
    return {
      g: null,
      inner: null,
      svg: null,
    };
  },
  methods: {
    _createGroupGraph(g) {
      //TODO 그래프 그리기 총괄
    },
    _createNodeObject(nodeInfo) {
      //TODO dagre node Object 만들기
    },
    _createEdgeObject(edgeInfo) {
      //TODO dagre edge Object 만들기
    },
    _createGraphObject() {
      //TODO HashMap 형태로 오브젝트 생성하기
      //TODO Node정보 생성
      //TODO Edge정보 생성
    },
    componentToElement(component, props) {
      const vueComponent = Vue.extend(component);
      try {
        return new vueComponent({ props }).$mount().$el;
      } catch (e) {
        console.log(e);
        return null;
      }
    },
    render() {},
  },
};
</script>
