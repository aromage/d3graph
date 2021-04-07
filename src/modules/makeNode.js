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

const makeNodeInfo = (datas) => {
  const nodes = {
    id: 'ALL',
    name: 'ALL',
    children: [],
  };
  const group = nodes.children;
  datas.forEach((data) => {
    //시작점
    const startItem = makeNode(group, data.startGroup, data.start);
    if (startItem) group.push(startItem);

    //끝점
    const endItem = makeNode(group, data.endGroup, data.end);
    if (endItem) group.push(endItem);
  });
  return [nodes];
};

//노드 정보 추가
function makeNode(group, groupName, nodeName) {
  const findGroup = group.find((node) => node?.name === groupName);
  if (findGroup) {
    const findNode = findGroup.children.find((node) => node?.name === nodeName);
    if (!findNode) {
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

export { makeNodeInfo };
