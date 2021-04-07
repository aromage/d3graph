<template>
  <v-app>
    <!-- 탑바 영역 -->
    <v-app-bar app color="white">
      <v-toolbar-title style="cursor: pointer" @click="$router.push('/')">MEDIA WATCHER</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn text color="black"><v-icon dark> mdi-format-list-bulleted-square </v-icon><span>열기</span></v-btn>
    </v-app-bar>
    <!-- 사이드바 영역 -->
    <v-navigation-drawer class="pt-16" absolute permanent>
      <SideNaviList />
    </v-navigation-drawer>
    <!-- 메인 영역 -->
    <v-main class="main">
      <v-container fluid>
        <v-row class="fill-height">
          <v-col>
            <transition name="fade">
              <router-view></router-view>
            </transition>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<script lang="ts">
import Vue from 'vue';
import SideNaviList from '@/components/App/SideNaviList.vue';

export default Vue.extend({
  name: 'App',
  components: { SideNaviList },

  data: () => ({
    //
  }),
});
</script>
<style lang="css" scoped>
.main {
  margin-left: 256px;
}
</style>
