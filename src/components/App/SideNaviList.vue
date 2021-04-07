<template>
  <v-list flat>
    <v-subheader>카테고리 선택</v-subheader>
    <v-treeview dense selectable v-model="selection" :items="items" return-object></v-treeview>
  </v-list>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'HelloWorld',

  computed: {
    items() {
      return this.$store.getters['DATA/ITEMS'];
    },
    selection: {
      get() {
        return this.$store.getters['DATA/SELECTED_ITEMS'];
      },
      set(value) {
        this.$store.commit('DATA/SET_SELECTED_ITEMS', value);
      },
    },
  },
  data() {
    return {};
  },
});
</script>
<style scoped>
.theme--light.v-treeview {
  font-size: 14px !important;
}
</style>
