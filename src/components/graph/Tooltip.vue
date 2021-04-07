<template>
  <div class="tooltip">
    <div class="tooltip-body" v-for="node in data" :key="node.id">
      <header class="tooltip-header">{{ tooltipHeader(node.route) }}</header>
      <ul class="tooltip-box">
        <li class="tooltip-content" v-for="content in tooltipContent(node.node)" :key="content.id">
          <div class="header">{{ content.label }}</div>
          <div class="body">{{ content.data }}</div>
        </li>
      </ul>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    data: {
      required: true,
    },
  },
  methods: {
    tooltipHeader(route) {
      return route.start + '  ➔  ' + route.end;
    },
    tooltipContent(nodeInfo) {
      return [
        {
          label: '통신방식/인코딩',
          data: nodeInfo.communicationMethod + '/' + nodeInfo.dataEncoding,
        },
        {
          label: '주요데이터',
          data: nodeInfo.mainData,
        },
        {
          label: '연동목적',
          data: nodeInfo.purpose,
        },
      ];
    },
  },
};
</script>
<style scoped>
.tooltip {
  padding: 0.1rem;
  max-height: 300px;
  overflow-y: auto;
}

.tooltip::-webkit-scrollbar {
  width: 0.4rem;
}
.tooltip::-webkit-scrollbar-thumb {
  background-color: white;
}
.tooltip::-webkit-scrollbar-track {
  background-color: grey;
}

.tooltip-header {
  color: #3d88e3;
  margin-top: 0.2rem;
  margin-bottom: 0.6rem;
  font-weight: bold;
  font-size: 1rem;
}

.tooltip-box {
  margin-top: 0.3rem;
  margin-bottom: 0.5rem;
}

.tooltip-content {
  margin-bottom: 0.2rem;
  padding: 0.4rem;
  display: flex;
  background-color: #303131;
  margin-right: 0.5rem;
  /* width: 19rem; */
}
.tooltip-content:last-child {
  margin-bottom: 0.8rem;
}

.tooltip-content .header {
  width: 8rem;
  color: #fcd189;
}
.tooltip-content .body {
  color: white;
  width: 11rem;
}
</style>
