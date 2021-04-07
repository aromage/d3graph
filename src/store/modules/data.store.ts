/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { makeNodeInfo, makeItemsInfo } from '@/modules/NodeGroup';

const state = {
  nodes: null,
  currentGroup: null,

  items: [],
  selectedItems: [],
};

const getters = {
  ITEMS: (state) => state.items,
  SELECTED_ITEMS: (state) => state.selectedItems,
  SELECTED_ITEMS_WITH_NAME: (state) => state.selectedItems.map((item) => item.name),
  NODE_DATA: (state) => state.nodes,
  CURRENT_GROUP: (state) => state.currentGroup,
};

const mutations = {
  SET_SELECTED_ITEMS(state, payload) {
    state.selectedItems = payload;
  },
  SET_CURRENT_GROUP(state, payload) {
    state.currentGroup = payload;
  },
  SET_NODE_DATA: (state, payload) => {
    state.nodes = makeNodeInfo(payload);
    state.items = makeItemsInfo(payload);
  },
};

const actions = {
  ['isRight'](context, payload) {
    console.log('이게 된다고?');
    console.log(context);
  },
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};
