<template>
  <div class="label-container">
    <div class="label-content">
      {{ nodeInfo.communicationMethod }}
      /
      {{ nodeInfo.dataEncoding }}
    </div>
    <div class="label-content">
      {{ nodeInfo.mainData }}
    </div>
  </div>
</template>
<script>
export default {
  props: {
    nodeInfo: {
      required: true,
    },
  },
};
</script>
