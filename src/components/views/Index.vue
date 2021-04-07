<template>
  <v-container>
    <!-- <v-btn color="teal" @click="Initialize">re:Rendering</v-btn> -->
    <div id="svg-container">
      <svg id="svg" width="100%" height="100vh"></svg>
    </div>
  </v-container>
</template>

<script lang="js">
import Vue from 'vue';
import { CustomDagre } from '@/modules/CustomDagre';
import { datas } from '@/assets/data/sampleData';


export default Vue.extend({
  mounted() {
    this.store.watch(
      (state, getters) => getters['DATA/SELECTED_ITEMS_WITH_NAME'],
      (newValue, oldValue) => {
        this.render();
      }
    );

    this.modifydatas = this.datas.map((d) => {
      return  {
        startGroup: d[0],
        start: d[1],
        endGroup: d[2],
        end: d[3],
        purpose: d[4],
        mainData: d[5],
        communicationMethod: d[6],
        dataEncoding: d[7],
        dataFlow: d[8],
        isRealTimeCommunication: d[9],
        isPlacementCommunication: d[10],
        sharedCommunicationChannel: d[11],
      };
    });

    this.store.commit('DATA/SET_NODE_DATA', this.modifydatas);

    this.render();
  },
  data() {
    return {
      graph: new CustomDagre('#svg'),
      datas: datas,
      modifydatas: [],
    };
  },
  computed: {
    nodeData() {
      return this.store.getters['DATA/NODE_DATA'];
    },
    currentGroup() {
      return this.store.getters['DATA/CURRENT_GROUP'];
    },
    selectedItems() {
      return this.store.getters['DATA/SELECTED_ITEMS_WITH_NAME'];
    },
    items() {
      return this.store.getters['DATA/ITEMS'][0].children;
    }
  },

  methods: {
    Initialize() {
      this.store.commit('DATA/SET_CURRENT_GROUP', '');
      this.render();
    },
    render() {
      // 렌더링
      const g = this.graph.render(this.nodeData, this.currentGroup, this.selectedItems, this.items);
      this.graph.setEventNode('dblclick', (node) => {
          const groupName = g.node(node).class === 'childNode' ? '' : node;
          this.store.commit('DATA/SET_CURRENT_GROUP', groupName);
          this.render();
      });
    },
  },
});
</script>
<style>
.node rect,
.node circle,
.node ellipse {
  stroke: #333;
  fill: #fff;
  stroke-width: 1px;
}

.label-container {
  width: 100px;
  background-color: none;
  font-size: 0.75rem;
  color: #555;
  padding-right: 0.5rem;
  padding-left: 0.5rem;
}

.label-content {
  width: 90px;
  margin-bottom: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tippy-box {
  background-color: hsl(0, 2%, 27%);
}

.defaultEdge {
  stroke: #469ae4;
  stroke-width: 2px;
  fill: none;
}

.realTimeEdge {
  stroke: #3d88e3;
  stroke-width: 2px;
  fill: none;
  stroke-dasharray: 5px 10px;
  stroke-linecap: round;
  stroke-dashoffset: 1500;
  animation: arc-animation 50s linear infinite;
}

@keyframes arc-animation {
  to {
    stroke-dashoffset: 0;
  }
}

.clusters rect {
  fill: #e6e9ed;
  stroke: #aab2bd;
  stroke-width: 2;
  font-size: 15;
  rx: 20;
  ry: 20;
}

.clusters tspan {
  font-weight: bold;
  color: skyblue;
  padding: 1rem;
}

#svg-container .groupNode div.node {
  width: 8rem;
  height: 8rem;
  font: 0.05em 'Courier New', Courier, monospace;
  color: black;
}

.groupNode circle {
  width: 8rem;
  height: 8rem;
  fill: white;
  stroke-width: 8;
  stroke: #d0d7df;
}

#svg-container .childNode div.node {
  width: 6rem;
  height: 5rem;
  font: 0.05em 'Courier New', Courier, monospace;
  color: black;
}

.childNode circle {
  width: 6rem;
  height: 5rem;
  fill: white;
  stroke-width: 2;
  stroke: #d0d7df;
}
</style>
