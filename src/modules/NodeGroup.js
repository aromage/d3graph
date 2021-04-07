import { isConstructorDeclaration } from 'typescript';
import Vue from 'vue';

/**
 * ! node 정보
 * @param start : 시작 node
 * @param end : 끝 node
 * @param label : 추가 설명이 필요한 경우
 * @param value : 성공 데이터
 * @param error : 실패 데이터
 */

// let nodes = [
//   {
//     name: 'A',
//     group: 'Alpha',
//     destNode: [
//       {
//         name: 'B',
//         group: 'Beta',
//         value: 10,
//         error: 11,
//       },
//       {
//         name: 'F',
//         group: 'Beta',
//         value: 20,
//         error: 10,
//       },
//     ],
//   },
//   {
//     name: 'B',
//     group: 'Beta',
//     destNode: [
//       {
//         name: 'F',
//         group: 'Beta',
//         value: 30,
//         error: 9,
//       },
//     ],
//   },
// ];

// const items= {
//       id: 'ALL',
//       name: 'ALL',
//       children: [
//         {
//           id: 'Group_1',
//           name: 'Alpha',
//           children: [
//             { id: 1, name: 'A' },
//             { id: 2, name: 'B' },
//             { id: 3, name: 'C' },
//           ],
//         },
//         {
//           id: 'Group_2',
//           name: 'Beta',
//           children: [
//             { id: 4, name: 'D' },
//             { id: 5, name: 'E' },
//             { id: 6, name: 'F' },
//           ],
//         },
//         {
//           id: 'Group_3',
//           name: 'Gamma',
//           children: [{ id: 7, name: 'G' }],
//         },
//       ],
//     },

//! 얘를 Node 데이터로
//TODO 리팩토링 할 것 ㅡㅡ
const makeItemsInfo = (datas) => {
  const items = {
    id: 'ALL',
    name: 'ALL',
    children: [],
  };
  const group = items.children;
  let id = 1;
  let groupId = 1;
  datas.forEach((data) => {
    //시작점 순회
    const startGroup = group.find((node) => node?.name === data.startGroup);
    if (startGroup) {
      if (!startGroup.children.find((node) => node?.name === data.start)) {
        const item = {
          id: id++,
          name: data.start,
        };
        startGroup.children.push(item);
      }
    } else {
      const item = {
        id: 'Group_' + groupId++,
        name: data.startGroup,
        children: [
          {
            id: id++,
            name: data.start,
          },
        ],
      };
      group.push(item);
    }

    //끝점 순회
    const endGroup = group.find((node) => node?.name === data.endGroup);
    if (endGroup) {
      if (!endGroup.children.find((node) => node?.name === data.end)) {
        const item = {
          id: id++,
          name: data.end,
        };
        endGroup.children.push(item);
      }
    } else {
      const item = {
        id: 'Group_' + groupId++,
        name: data.endGroup,
        children: [
          {
            id: id++,
            name: data.end,
          },
        ],
      };
      group.push(item);
    }
  });

  return [items];
};

function makeItem(group, groupName, nodeName) {
  const findGroup = group.find((node) => node?.name === groupName);
  if (findGroup) {
    if (!findGroup.children.find((node) => node?.name === nodeName)) {
      findGroup.children.push({
        id: nodeName,
        name: nodeName,
      });
    }
    return null;
  } else {
    return {
      id: 'Group_' + groupName,
      name: groupName,
      children: [
        {
          id: nodeName,
          name: nodeName,
        },
      ],
    };
  }
}

//! 코드 꼴좀 보셈 -> 얘를 Edge 데이터로
const makeNodeInfo = (datas) => {
  const nodes = [];

  datas.forEach((data) => {
    const found = nodes.find((node) => node?.name === data.start);
    if (found) {
      const destNode = found.destNode.find((node) => node?.name === data.end);

      //목적지 노드정보가 있을경우 합산, 없으면 생성
      if (destNode) {
        //이미 있는 노드 정보일경우 정보 합산?
      } else {
        const node = {
          name: data.end,
          group: data.endGroup,
          purpose: data.purpose,
          mainData: data.mainData,
          communicationMethod: data.communicationMethod,
          dataEncoding: data.dataEncoding,
          dataFlow: data.dataFlow,
          isRealTimeCommunication: data.isRealTimeCommunication,
          isPlacementCommunication: data.isPlacementCommunication,
          sharedCommunicationChannel: data.sharedCommunicationChannel,
        };
        found.destNode.push(node);
      }
    } else {
      const node = {
        name: data.start,
        group: data.startGroup,
        destNode: [
          {
            name: data.end,
            group: data.endGroup,
            purpose: data.purpose,
            mainData: data.mainData,
            communicationMethod: data.communicationMethod,
            dataEncoding: data.dataEncoding,
            dataFlow: data.dataFlow,
            isRealTimeCommunication: data.isRealTimeCommunication,
            isPlacementCommunication: data.isPlacementCommunication,
            sharedCommunicationChannel: data.sharedCommunicationChannel,
          },
        ],
      };
      nodes.push(node);
    }
  });

  return nodes;
};

export { makeNodeInfo, makeItemsInfo };
