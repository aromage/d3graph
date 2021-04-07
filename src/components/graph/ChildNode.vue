<template>
  <div class="node" :class="info.class">
    <!-- <header class="name">{{ info.name }}</header> -->
    <div class="subscript" v-if="info.class === 'groupNode'">
      <span class="count">{{ info.groupCount }}</span>
    </div>
    <div class="img" :class="{ child: info.class === 'childNode' }">
      <img :src="imgSrc" />
    </div>
    <div class="name">{{ info.name }}</div>
  </div>
</template>
<script>
import Vue from 'vue';

export default Vue.extend({
  props: {
    info: {
      required: true,
    },
  },
  computed: {
    imgSrc() {
      if (this.info.class === 'childNode') {
        const count = (this.info.image % 3) + 1;
        return require(`@/assets/childNode/${count}.png`);
      } else {
        const count = (this.info.image % 5) + 1;
        return require(`@/assets/groupNode/${count}.png`);
      }
    },
  },
});
</script>
<style scoped>
.groupNode .node > .name {
  width: 100%;
  font-size: 14px;
  /* transform: translate(0, -px);
  background-color: #3d88e3;
  border-radius: 0 0 55px 55px; */
  padding: 0.4rem;
  text-align: center;
  /* color: white; */
  font-weight: 500;
}

.childNode .node > .name {
  width: 100%;
  font-size: 12px;
  /* background-color: grey; */
  padding: 0.2rem;
  text-align: center;
  /* color: white; */
}

.subscript {
  text-align: end;
  font-size: 14px;
  color: #888;
}

.count {
  color: black;
  font-weight: 500;
}

.img {
  margin-top: 0.4rem;
  width: 100%;
  height: 50%;
  line-height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.child {
  margin-top: 0.6rem;
  height: 60%;
}

.groupNode img {
  width: 4rem;
  height: 4rem;
}

.childNode img {
  width: 2.5rem;
  height: 2.5rem;
}
</style>
