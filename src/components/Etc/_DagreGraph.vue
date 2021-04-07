<template>
  <div>
    <div v-if="!isData" style="margin: 0; position: absolute; top: 50%; left: 50%">
      No additional entries found, Wheel up again!
    </div>
    <svg id="servermapsvg" width="100%" height="610px"><g></g></svg>
  </div>
</template>
<script>
/**
 * Flow chart
 */

var default_e_style = 'fill: rgba(255,255,255, 0); stroke: #3d4a5d; stroke-width: 1px;';
var e_GRP_style = 'fill: rgba(255,255,255, 0); stroke: #3d4a5d; stroke-width: 2px; ';
var e_GRP_arrowhead_style = 'fill: #f1f1f1; stroke: #f1f1f1; stroke-width: 1px;';

var default_arrowhead_style = 'fill: #f1f1f1; stroke: #f1f1f1; stroke-width:2px;';

var imgPath = './../img/';
// var node = [
//         {
//             s_warg:"APP1",
// 			e_warg:"APP2",
// 			s_war:"GRP_APP33",
//             e_war:"GRP_APP33",
//             net_s:"",
//             net_f:"",
//         },
//         {
//             s_warg:"APP1",
// 			       e_warg:"APP2",
// 			       s_war:"GRP_APP44",
//             e_war:"GRP_APP44",
//             net_s:"",
//             net_f:"",
//         },
//         {
//             s_warg:"APP",
//             e_warg:"HC_openAPI",
//             s_war:"GRP_APP1",
//             e_war:"GRP_HC_openAPI01",
//             net_s:"1000",
//             net_f:"2",
//         },
// 		{
//             s_warg:"APP",
//             e_warg:"HC_openAPI1",
//             s_war:"GRP_APP1",
//             e_war:"GRP_HC_openAPI02",
//             net_s:"10",
//             net_f:"200",
//         }
// ];

var nameData = function (data) {
  var wasNservername = {};
  var warGroupName = {};
  data.forEach(function (item) {
    if (item.s_war.toLowerCase() != 'none') {
      wasNservername[item.s_war] = [item.s_was, item.s_server];
    }
    if (item.s_warg.toLowerCase() != 'none') {
      if ($.inArray(item.s_warg, Object.keys(warGroupName)) > 0 && item.s_war.toLowerCase() != 'none') {
        var warName = warGroupName[item.s_warg];
        warName.push(item.s_war);
        warGroupName[item.s_warg] = warName;
      } else if (item.s_war.toLowerCase() != 'none') {
        warGroupName[item.s_warg] = [item.s_war];
      } else {
        warGroupName[item.s_warg] = [];
      }
    }
    if (item.e_warg.toLowerCase() != 'none') {
      if ($.inArray(item.e_warg, Object.keys(warGroupName)) > 0 && item.e_war.toLowerCase() != 'none') {
        var warName = warGroupName[item.e_warg];
        warName.push(item.e_war);
        warGroupName[item.e_warg] = warName;
      } else if (item.e_war.toLowerCase() != 'none') {
        warGroupName[item.e_warg] = [item.e_war];
      } else {
        warGroupName[item.e_warg] = [];
      }
    }
  });
  /*console.debug(warGroupName);
	console.debug(wasNservername);
	console.debug('-----------------');*/
  return { wasNservername: wasNservername, warGroupName: warGroupName };
};

// 여기서 노트 우클릭으로 그룹을 들어갔다 나온다
// 그런데 closed는 뭐지...?
var create_server_map_context_menu = function (data, $scope, mode) {
  var namedata = nameData(data);
  var wasNservername = namedata.wasNservername;
  var warGroupName = Object.keys(namedata.warGroupName);

  $.contextMenu('destroy');
  $.contextMenu({
    selector: '#servermapsvg > g > g > g.nodes > .warGroupNode',
    className: 'right_contextmenu',
    items: {
      open: {
        name: 'Server Group Open',
        callback: function () {
          //slide_leftright_window_action('hide');
          var nodeID = $(this).find('p').html();
          server_map_graph(data, '#servermapsvg', 'server', nodeID, $scope);
        },
        disabled: function (key, opt) {
          //                			console.log($(this).context.classList);
          var nodeClass = $(this).context.classList;
          if ($.inArray('internalNode', nodeClass) < 0) {
            return !this.data('OpenDisabled');
          }
        },
      },
    },
  });

  $.contextMenu({
    selector: '#servermapsvg > g > g > g.nodes > .warNode',
    className: 'right_contextmenu2',
    items: {
      close: {
        name: 'Server Group Close',
        callback: function () {
          //slide_leftright_window_action('hide');
          server_map_graph(data, '#servermapsvg', 'group', '', $scope);
        },
        disabled: function (key, opt) {
          var nodeID = $(this).find('h4').html();
          if ($.inArray(nodeID, warGroupName) > -1) {
            return !this.data('closeDisabled');
          }
        },
      },
    },
  });
};

//--------------------------------------------------------------------------------------------------------------//
/*
 * Make Server Map Closed Group Node
 *
 * sg: startServerGroupName
 * swar_f: Start WAR Fail Count
 *
 * eg: endServerGroupName
 *
 * net_s: Start To End Success Count
 * net_f: Start To End Fail Count
 */
var patt = [/ExternalAPI/, /MasterAPI/, /EC/, /HC_/];

var make_closed_group_node = function (data, g) {
  var failCount = new Map();
  var successCount = new Map();

  data.forEach(function (item, index) {
    var start = item.s_warg;
    var end = item.e_warg;
    var grp = new RegExp('GRP_');

    var startClassType = null;
    var endClassType = null;

    if (end == 'COLLECT') {
      end = 'CT';
    }

    patt.some(function (item) {
      var result = end.match(item);
      if (result !== null) {
        endClassType = ' internalNode';
        return true;
      } else {
        endClassType = ' externalNode';
      }
    });
    startClassType = ' externalNode';
    if (end == 'CT') {
      end = 'COLLECT';
    }
    //duplicate key check
    if (failCount.has(end)) {
      failCount.set(end, failCount.get(end) + item.net_f);
      successCount.set(end, successCount.get(end) + item.net_s);
    } else {
      failCount.set(end, item.net_f);
      successCount.set(end, item.net_s);
    }

    if (
      (grp.test(item.s_war) && item.e_war == 'NONE') ||
      (item.s_war == 'NONE' && grp.test(item.e_war)) ||
      (grp.test(item.s_war) && grp.test(item.e_war))
    ) {
      if (item.s_warg.toLowerCase() != 'none') {
        if (!g.node(item.s_warg)) {
          g.setNode(item.s_warg, {
            labelType: 'html',
            label: label_html(item.s_warg, item.s_warg, 0, g),
            class: 'warGroupNode' + startClassType,
          });
        } else {
          g.node(item.s_warg).label = label_html(item.s_warg, item.s_warg, 0, g);
        }
      }

      if (item.e_warg.toLowerCase() != 'none') {
        if (!g.node(item.e_warg)) {
          g.setNode(item.e_warg, {
            labelType: 'html',
            label: label_html(item.e_warg, item.e_warg, item.bus_f, g),
            class: 'warGroupNode' + endClassType,
          });
        } else {
          g.node(item.e_warg).label = label_html(item.e_warg, item.e_warg, item.bus_f, g);
        }
      }

      if (item.s_warg.toLowerCase() != 'none' && item.e_warg.toLowerCase() != 'none') {
        g.setEdge(item.s_warg, item.e_warg, {
          labelType: 'html',
          //label : edge_label_cnt(item.s_warg, item.e_warg, item.net_s, item.net_f, item.kaf_s, item.kaf_f, g, index),
          label: edge_label_cnt(
            item.s_warg,
            item.e_warg,
            successCount.get(end),
            failCount.get(end),
            item.kaf_s,
            item.kaf_f,
            g,
            index
          ),
          lineInterpolate: 'monotone',
        });
      }
    }
  });
  failCount.clear();
  successCount.clear();
};

//--------------------------------------------------------------------------------------------------------------//
/*
 * Make Server Map Open Group Node
 *
 * s_warg: startServerGroupName
 * s_war: startWARName
 *
 * eg: endServerGroupName
 * en: endWARName
 * bus_f: End WAR Fail Count
 *
 * net_s: Start To End Success Count
 * net_f: Start To End Fail Count
 */
var make_open_group_node = function (data, g, open_G) {
  g.setGraph({
    rankdir: 'LR', // Graph 방향
    ranksep: 250,
    nodesep: 30,
    marginx: 40,
    marginy: 40,
  });

  data.forEach(function (item, index) {
    //var patt = [/3M./, /EC_/, /HC_/];
    var grp = new RegExp('GRP_');
    var start = item.s_warg;
    var end = item.e_warg;

    var sNodeClass = null;
    var eNodeClass = null;

    if (end == 'COLLECT') {
      end = 'CT';
    }
    patt.some(function (item) {
      var result = end.match(item);
      //console.log('end : ' + end + ' item : ' + item + ' result : ' + result);
      if (result !== null) {
        eNodeClass = 'warGroupNode internalNode';
        return true;
      } else {
        eNodeClass = 'warGroupNode externalNode';
      }
    });
    sNodeClass = 'warGroupNode externalNode';

    //var sNodeClass = patt[0].test(start) ? 'warGroupNode internalNode' : (patt[1].test(start) ? 'warGroupNode internalNode' : 'warGroupNode externalNode');
    // var eNodeClass = patt[0].test(end) ? 'warGroupNode internalNode' : (patt[1].test(end) ? 'warGroupNode internalNode' : 'warGroupNode externalNode');

    if (end == 'CT') {
      end = 'COLLECT';
    }
    if (start == open_G && end == open_G) {
      if (grp.test(item.s_war) && grp.test(item.e_war)) {
        start = item.s_war;
        end = item.e_war;
        sNodeClass = patt[0].test(start) ? 'warNode' : patt[1].test(start) ? 'warNode' : 'warNode externalNode';
        sNodeClass += grp.test(start) ? ' GRPNode' : '';
        eNodeClass = patt[0].test(end) ? 'warNode' : patt[1].test(end) ? 'warNode' : 'warNode externalNode';
        eNodeClass += grp.test(end) ? ' GRPNode' : '';
        openGSelfNode(start, end, sNodeClass, eNodeClass, item, g, open_G, index);
        return 0;
      }
      return 0;
    }

    if (item.s_warg == open_G) {
      start = item.s_war;
      sNodeClass = patt[0].test(start) ? 'warNode' : patt[1].test(start) ? 'warNode' : 'warNode externalNode';
      sNodeClass += grp.test(start) ? ' GRPNode' : '';
      openGStartNode(start, end, sNodeClass, eNodeClass, item, g, open_G, index);

      return 0;
    }
    if (item.e_warg == open_G) {
      end = item.e_war;
      eNodeClass = patt[0].test(end) ? 'warNode' : patt[1].test(end) ? 'warNode' : 'warNode externalNode';
      eNodeClass += grp.test(end) ? ' GRPNode' : '';
      openGEndNode(start, end, sNodeClass, eNodeClass, item, g, open_G, index);
      return 0;
    }

    if (
      (grp.test(item.s_war) && item.e_war == 'NONE') ||
      (grp.test(item.e_war) && item.s_war == 'NONE') ||
      (grp.test(item.s_war) && grp.test(item.e_war))
    ) {
      if (start.toLowerCase() != 'none' && end.toLowerCase() != 'none') {
        if (!g.node(start)) {
          g.setNode(start, {
            labelType: 'html',
            label: label_html(item.s_warg, start, 0, g),
            class: sNodeClass,
          });
        } else {
          g.node(start).label =
            item.s_warg == open_G ? childNodeLabelHtml(start, 0, g) : label_html(item.s_warg, start, 0, g);
        }
        if (!g.node(end)) {
          g.setNode(end, {
            labelType: 'html',
            label: label_html(item.e_warg, end, item.bus_f, g),
            class: eNodeClass,
          });
        }
        g.setEdge(start, end, {
          labelType: 'html',
          label: edge_label_cnt(start, end, item.net_s, item.net_f, item.kaf_s, item.kaf_f, g, index),
          lineInterpolate: 'monotone',
        });
      }
    }
  });
};

/*
 * openG Self Node
 */
var openGSelfNode = function (start, end, sNodeClass, eNodeClass, item, g, open_G, index) {
  var grp = new RegExp('GRP_');
  if (!g.node(start)) {
    g.setNode(start, {
      labelType: 'html',
      label: grp.test(start) ? label_html(item.s_warg, start, 0, g) : childNodeLabelHtml(start, 0, g),
      class: sNodeClass,
    });
    g.setNode(item.s_warg, {
      style: 'fill: #e5e5e5; stroke: #eee; stroke-width:0px;',
    });
    g.setParent(start, item.s_warg);
  } else {
    g.node(start).label = grp.test(start) ? label_html(item.s_warg, start, 0, g) : childNodeLabelHtml(start, 0, g);
  }

  if (!g.node(end)) {
    g.setNode(end, {
      labelType: 'html',
      label: label_html(item.e_warg, end, item.bus_f, g),
      class: eNodeClass,
    });
  } else {
    g.node(end).label = grp.test(end)
      ? label_html(item.e_warg, end, item.bus_f, g)
      : childNodeLabelHtml(end, item.bus_f, g);
  }

  g.setEdge(start, end, {
    labelType: 'html',
    label: edge_label_cnt(start, end, item.net_s, item.net_f, item.kaf_s, item.kaf_f, g, index),
    lineInterpolate: 'monotone',
  });
};

/*
 * openG Start Node
 */
var openGStartNode = function (start, end, sNodeClass, eNodeClass, item, g, open_G, index) {
  var grp = new RegExp('GRP_');
  if (item.e_war == 'NONE' || grp.test(item.e_war)) {
    if (!g.node(start)) {
      g.setNode(start, {
        labelType: 'html',
        label: grp.test(start) ? label_html(item.s_warg, start, 0, g) : childNodeLabelHtml(start, 0, g),
        class: sNodeClass,
      });
      g.setNode(item.s_warg, {
        style: 'fill: #e5e5e5; stroke: #eee; stroke-width:0px;',
      });
      g.setParent(start, item.s_warg);
    } else {
      g.node(start).label = grp.test(start) ? label_html(item.s_warg, start, 0, g) : childNodeLabelHtml(start, 0, g);
    }

    if (!g.node(end)) {
      g.setNode(end, {
        labelType: 'html',
        label: label_html(item.e_warg, end, item.bus_f, g),
        class: eNodeClass,
      });
    } else {
      g.node(end).label = label_html(item.e_warg, end, item.bus_f, g);
    }

    g.setEdge(start, end, {
      labelType: 'html',
      label: edge_label_cnt(start, end, item.net_s, item.net_f, item.kaf_s, item.kaf_f, g, index),
      lineInterpolate: 'monotone',
    });
  }
};

/*
 * openG end Node
 */
var openGEndNode = function (start, end, sNodeClass, eNodeClass, item, g, open_G, index) {
  var grp = new RegExp('GRP_');
  if (item.s_war == 'NONE' || grp.test(item.s_war)) {
    if (!g.node(start)) {
      g.setNode(start, {
        labelType: 'html',
        label: label_html(item.s_warg, start, 0, g),
        class: sNodeClass,
      });
    } else {
      g.node(start).label = label_html(item.s_warg, start, 0, g);
    }

    if (!g.node(end)) {
      g.setNode(end, {
        labelType: 'html',
        label: grp.test(end) ? label_html(item.e_warg, end, item.bus_f, g) : childNodeLabelHtml(end, item.bus_f, g),
        class: eNodeClass,
      });
      g.setNode(item.e_warg, {
        style: 'fill: #e5e5e5; stroke: #eee; stroke-width:0px;',
      });
      g.setParent(end, item.e_warg);
    } else {
      g.node(end).label = grp.test(end)
        ? label_html(item.e_warg, end, item.bus_f, g)
        : childNodeLabelHtml(end, item.bus_f, g);
    }

    g.setEdge(start, end, {
      labelType: 'html',
      label: edge_label_cnt(start, end, item.net_s, item.net_f, item.kaf_s, item.kaf_f, g, index),
      lineInterpolate: 'monotone',
    });
  }
};
/*
 * Set Edge Label
 */
var edge_label_cnt = function (start, end, net_s, net_f, kaf_s, kaf_f, g, index) {
  var edge_label_html = '<div style="color:#666; font-size:12pt;"><div>' + net_s;
  edge_label_html += net_f != 0 ? '/ <span style="color:red;"> ' + net_f + '</span></div>' : '</div>';
  //edge_label_html += (kaf_s == 0 && kaf_f == 0) ? ('<div class="kafEdge" style="display:none;">')
  //													: ('<div class="kafEdge kaf-show" name="' + index + '"><span style="color:#aaa;">Kafka: </span> ' + kaf_s);
  //edge_label_html += (kaf_f != 0) ? ('/ <span style="color:#FF6666"> ' + kaf_f + '</span></div></div>') : ('</div></div>');

  return edge_label_html;
};

/*
 * Set Group(Parent) Node Label
 */
var label_html = function (labelImgName, label, bus_f, g) {
  var fontSize = new RegExp('GRP_').test(label) ? 10 : 10;
  var labelName = label.replace('GRP_', '');
  var label_img = nodeLabelImgCheck(labelImgName, g);

  if (g.node(label)) {
    var swar_label = g.node(label).label.match(/Fail : \d+/);
    var new_bus_f = swar_label
      ? bus_f != 0
        ? swar_label[0].match(/\d+/) * 1 + bus_f
        : swar_label[0].match(/\d+/) * 1
      : bus_f != 0
      ? bus_f
      : '';
    var l_html =
      new_bus_f != ''
        ? '<div style="min-height:80px;"><img class="' +
          label_img +
          '" src="' +
          imgPath +
          label_img +
          '.png" style="height:50px; width:50px"><br>' +
          '<p class="' +
          label_img +
          '" style="margin:5px 0 10px; font-size:' +
          fontSize +
          'px;width:80px">' +
          labelName +
          '</p>' +
          '<div><span class="nodeFailCnt">Fail : ' +
          new_bus_f +
          '</span></div></div>'
        : '<div style="min-height:80px;"><img class="' +
          label_img +
          '" src="' +
          imgPath +
          label_img +
          '.png" style="height:50px; width:50px"><br>' +
          '<p class="' +
          label_img +
          '" style="margin:5px 0; font-size:' +
          fontSize +
          'px;width:80px">' +
          labelName +
          '</p></div>';
    return l_html;
  }

  var l_html =
    bus_f != 0
      ? '<div style="min-height:80px;"><img class="' +
        label_img +
        '" src="' +
        imgPath +
        label_img +
        '.png" style="height:50px; width:50px"><br>' +
        '<p class="' +
        label_img +
        '" style="margin:5px 0 10px; font-size:' +
        fontSize +
        'px;width:80px">' +
        labelName +
        '</p>' +
        '<div><span class="nodeFailCnt">Fail : ' +
        bus_f +
        '</span></div></div>'
      : '<div style="min-height:80px;"><img class="' +
        label_img +
        '" src="' +
        imgPath +
        label_img +
        '.png" style="height:50px; width:50px"><br>' +
        '<p class="' +
        label_img +
        '" style="margin:5px 0; font-size:' +
        fontSize +
        'px;width:80px">' +
        labelName +
        '</p></div>';
  return l_html;
};

/*
 * Set Child Node Label
 */
var childNodeLabelHtml = function (label, sunit, g) {
  if (g.node(label)) {
    var sunit_label = g.node(label).label.match(/Fail : [+-]?\d+/);
    var new_sunit = sunit_label
      ? sunit != 0
        ? sunit_label[0].match(/\d+/) * 1 + sunit
        : sunit_label[0].match(/\d+/) * 1
      : sunit != 0
      ? sunit
      : '';
    var l_html =
      new_sunit != ''
        ? '<h4 class="childNodeLabel">' +
          label +
          '</h4><tr><td><span class="nodeFailCnt">Fail : ' +
          new_sunit +
          '</td></tr>'
        : '<h4 class="childNodeLabel">' + label + '</h4>';
    return l_html;
  }

  var l_html =
    sunit != 0
      ? '<h4 class="childNodeLabel">' + label + '</h4><tr><td><span class="nodeFailCnt">Fail : ' + sunit + '</td></tr>'
      : '<h4 class="childNodeLabel">' + label + '</h4>';
  return l_html;
};

/*
 * Node Imag Setting
 */
var nodeLabelImgCheck = function (label_img, g) {
  var nodeLabelImg = [
    /EC$/,
    /ETC/,
    /INFRA$/,
    /OPENAPI/,
    /SQL/,
    /POSTGRESQL/,
    /3M/,
    /START/,
    /END/,
    /COLLECT/,
    /3RT_PARTY/,
    /HMG_EC_01/,
    /HMG_EC_02/,
  ];
  var labelImgName = label_img.toUpperCase();
  var imgName = 'API1';
  nodeLabelImg.forEach(function (item) {
    var result = labelImgName.match(item);
    if (result) {
      imgName = result;
    }
  });
  return imgName;
};

/*
 * Node Click
 */
var node_click_action = function (g, id, $scope, warGroupName) {
  var highLight;
  var nodeClass = g.node(id).class;

  if (nodeClass.indexOf('highLight') != -1) {
    g.node(id).class = nodeClass.toString().replace('highLight', ' ').trim();

    g.edges().forEach(function (e, v, w) {
      var edge = g.edge(e);
      edge.style = new RegExp('GRP_').test(e.w) || new RegExp('GRP_').test(e.v) ? e_GRP_style : default_e_style;
      edge.arrowhead = 'vee';
      edge.arrowheadStyle =
        new RegExp('GRP_').test(e.w) || new RegExp('GRP_').test(e.v) ? e_GRP_arrowhead_style : default_arrowhead_style;
    });
    highLight = 'off';
  } else {
    g.edges().forEach(function (e, v, w) {
      var edge = g.edge(e);
      edge.style = new RegExp('GRP_').test(e.w) || new RegExp('GRP_').test(e.v) ? e_GRP_style : default_e_style;
      edge.arrowhead = 'vee';
      edge.arrowheadStyle =
        new RegExp('GRP_').test(e.w) || new RegExp('GRP_').test(e.v) ? e_GRP_arrowhead_style : default_arrowhead_style;
      if (!new RegExp('GRP_').test(e.v) && !new RegExp('GRP_').test(e.w)) {
        if (e.v == id) {
          edge.style = 'fill: rgba(255,255,255, 0); stroke: #800080; stroke-width: 1.5px;';
          edge.arrowhead = 'vee';
          edge.arrowheadStyle = 'fill: #800080; stroke: #800080; stroke-width:4px;';
        } else if (e.w == id) {
          edge.style = 'fill: rgba(255,255,255, 0); stroke: #32CD32; stroke-width: 1.5px;';
          edge.arrowhead = 'vee';
          edge.arrowheadStyle = 'fill: #32CD32; stroke: #32CD32; stroke-width:4px;';
        }
      }
    });
    g.node(id).class += ' highLight';
    highLight = 'on';
  }
  console.debug('click node : ' + id);

  return highLight;
};

var servermap_style_node_edge = function (g) {
  // Set custom edge labelpos
  g.edges().forEach(function (v) {
    var edge = g.edge(v);
    edge.labelType = 'html';
    edge.label = "<p style='background-color: rgba(255,255,255,0.5); font-size: 14pt;'> " + edge.label + ' </p>';
    edge.labelpos = 'c';
    edge.style = new RegExp('GRP_').test(v.w) || new RegExp('GRP_').test(v.v) ? e_GRP_style : default_e_style;
  });

  g.nodes().forEach(function (v) {
    var node = g.node(v);
    node.rx = node.ry = 5;
  });
};

var server_map_zoom_translate = function (zoom, g, svg) {
  var zoomScale = zoom.scale();
  var graphWidth = g.graph().width + 80;
  var graphHeight = g.graph().height + 40;
  var width = parseInt(svg.style('width').replace(/px/, ''));
  var height = parseInt(svg.style('height').replace(/px/, ''));

  zoomScale = Math.min(width / graphWidth, height / graphHeight);
  if (zoomScale > 1.4) zoomScale -= 0.1;
  var translate = [width / 2 - (graphWidth * zoomScale) / 2, height / 2 - (graphHeight * zoomScale) / 2];
  zoom.translate(translate);
  zoom.scale(zoomScale);
  zoom.event(d3.select('svg'));
};

/*
 * Graph Object
 */
var create_graph_obj = function () {
  var g = new dagreD3.graphlib.Graph({
    directed: true,
    multigraph: false,
    compound: true,
  });
  g.setGraph({
    rankdir: 'LR', // Graph 방향
    ranksep: 150,
    nodesep: 30,
    marginx: 40,
    marginy: 40,
  });
  return g;
};
/// Dagre D3 Graph ///
var server_map_graph = function (data, disply_place, mode, open_G, $scope, spanIndex) {
  $(disply_place + ' > g > *').remove();
  var svg = d3.select(disply_place),
    inner = svg.select('g');
  var render = new dagreD3.render();

  var g = create_graph_obj();

  switch (mode) {
    case 'group':
      make_closed_group_node(data, g);
      servermap_style_node_edge(g);
      break;
    case 'server':
      make_open_group_node(data, g, open_G);
      g.graph().transition = function transition(selection) {
        //transition with duration 1000ms
        return selection.transition().duration(700);
      };
      servermap_style_node_edge(g);
      break;
  }

  // Set up zoom support
  var zoom = d3.behavior.zoom().on('zoom', function () {
    inner.attr('transform', 'translate(' + d3.event.translate + ')' + 'scale(' + d3.event.scale + ')');
  });
  svg.call(zoom);
  render(inner, g);
  server_map_zoom_translate(zoom, g, svg);

  window.onresize = function (event) {
    server_map_zoom_translate(zoom, g, svg);
  };

  if (mode != 'transaction') {
    var namedata = nameData(data);
    var warGroupName = Object.keys(namedata.warGroupName);

    //node click event (highlight)
    svg.selectAll('g.node').on('click', function (id) {
      if (new RegExp('GRP_').test(id)) {
        return 0;
      }
      //slide_leftright_window_action('hide');
      var highLight = node_click_action(g, id, $scope, warGroupName);
      render(inner, g);
    });
    create_server_map_context_menu(data, $scope, mode);
  }
};

export default {
  name: 'DagreGraph',
  //   components: {
  //     InstanceCollectStatus: InstanceCollectStatus,
  //     LabelCodeModalTrx,
  //   },
  data() {
    return {
      id: '',
      isData: true,
      results: [],
    };
  },
  created() {
    this.$EventBus.$on(
      'callTest',
      function (paramObj) {
        console.log('callFunction!! ', paramObj);
        this.callFunction(paramObj);
      }.bind(this)
    );
  },
  methods: {
    callFunction: async function (paramObj) {
      const baseURI = this.$srvUrl;
      await this.$http.get(`${baseURI}/api/v1/stat/servermap1`, paramObj).then((result) => {
        this.results = result.data.result.data;
        console.log('servermap');
        console.log('xview');
        server_map_graph(this.results.result.data, '#servermapsvg', 'group', null);
      });
    },
  },
  mounted() {},
  watch: {},
};
</script>
<style>
/* fixed css */

.page-title {
  font-size: 15pt;
  border-left: 8px solid #555;
  padding-left: 10px;
  height: 22px;
  line-height: 22px;
}

.tx-detail-title-div {
  font-size: 12pt;
  margin-left: 0px !important;
  color: #555;
}

.tx-detail-title {
  font-size: 12pt;
  border-left: 8px solid #555;
  margin-left: 0px !important;
  margin-bottom: 25px;
  margin-top: 15px;
  padding-left: 12px;
  height: 8px;
  line-height: 8px;
  color: #555;
}

.event-stack-msg {
  font-size: 12pt;
  margin-left: 0px;
  margin-bottom: 25px;
  margin-top: 15px;
  padding-left: 12px;
  height: 8px;
  line-height: 8px;
  color: #ff0033;
}

.servermapInfo {
  color: #d5d5d5;
  padding: 5px 0 20px 0;
  font-size: 9pt;
  /* text-align: right; */
}

.transactionCountInfo {
  color: #d5d5d5;
  padding: 10px 0 0 0;
  font-size: 12pt;
}

.page-main {
  margin-top: 16px;
}

#bigscatterchart-ymax {
  padding: 0 2px !important;
  border: solid 1px #aacfe4;
  margin: 0px 0 5px 5px;
  height: 14px !important;
}
#bigscatterchart-ymin {
  padding: 0 2px !important;
  border: solid 1px #aacfe4;
  margin: 0px 0 5px 5px;
  height: 14px !important;
}

/* ServerMap & Transaction Map */
g.node {
  cursor: pointer;
  cursor: hand !important;
}

/* .edgePath path {
  stroke: #333;
  fill: #333;
  stroke-width: 1.5px;
} */

svg * {
  vertical-align: center;
  color: #444;
}

.war {
  width: 150px;
  height: 80px;
}

.highLight > rect,
.highLight > circle {
  stroke: blue;
  stroke-width: 1px;
}

.warGroupNode {
  fill: #e5e5e5;
  stroke: #bbb;
  stroke-width: 1px;
}

.warGroupNode_kimcy {
  fill: #ffffff;
  stroke: #bbb;
  stroke-width: 1px;
}

.warNode {
  fill: #aaa;
  stroke: #bbb;
  stroke-width: 1px;
}

.GRPNode {
  fill: #f1f1f1;
  stroke: #f1f1f1;
  stroke-width: 0px;
  stroke-dasharray: 5, 10;
}

/* .UNKNOWN_CLOUD {
	font-size:30px;
} */

.txNode {
  fill: #aaa;
  stroke: #bbb;
  stroke-width: 1px;
}

.txFailNode {
  fill: #ff5c5c !important;
  stroke: #bbb;
  stroke-width: 1px;
}

.externalNode {
  fill: #fff !important;
  stroke: #ddd;
  stroke-width: 1px;
}

.externalNode .UNKNOWN_CLOUD,
.externalNode .SQL,
.externalNode .POSTGRESQL,
.externalNode .ETC {
  color: #444 !important;
}

.tranNode {
  fill: #aaa;
  stroke: #aaa;
  stroke-width: 0px;
}

.right_contextmenu:before,
.right_contextmenu2:before {
  content: 'Server_Map';
  display: block;
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  background: #ddd;
  padding: 2px;
  font-family: Verdana, Arial, Helvetica, sans-serif;
  font-size: 11px;
  font-weight: bold;
}

.right_contextmenu :first-child,
.right_contextmenu2 :first-child {
  font-family: Verdana, Arial, Helvetica, sans-serif;
  font-size: 13px;
  margin-top: 20px;
}

.context-menu-list > .disabled {
  color: #ccc !important;
  font-style: italic;
}

.childNodeLabel {
  color: white;
  height: 40px;
  min-width: 100px;
  line-height: 40px;
}
.txNodeLabel {
  font-size: 20pt;
  color: white;
  min-width: 80px;
  min-height: 60px;
  line-height: 60px;
}

.edgeLabel td {
  padding: 3px 5px;
}

div .kafEdge,
div .kafEdge td {
  color: #aaa;
}

.edgeLabel {
  color: #666;
  font-size: 13pt;
}

.edgeLabel .edgeFail {
  color: #ff0033;
  font-weight: bold;
}

.nodeFailCnt {
  color: #ff0033;
  font-size: 5px;
}

.edgeLabelCnt {
  color: #666;
  font-size: 11pt;
}

.edgeFailCnt {
  color: #ff0033;
  font-size: 11pt;
}

g.label {
  font-weight: normal;
}

.boundTitle {
  font-size: 10pt;
}

/* transaction view modal */

#txInfo thead td {
  font-size: 13px;
  font-weight: bold;
}

#txInfo tbody td {
  color: #555;
  font-size: 12px;
}

.txEdgeLabel {
  color: #666;
  font-size: 10pt;
}

.kafkaDetail {
  font-size: 8px;
  width: 100%;
  margin-top: 5px;
}

.kafkaDetail thead td {
  font-weight: bold;
}

.kafkaDetail td {
  text-align: center;
}

.popOverFail {
  background-color: #ffccd6;
}

.animation-slow {
  animation: arc-animation 100s linear infinite;
}
.animation-medium {
  animation: arc-animation 50s linear infinite;
}
.animation-fast {
  animation: arc-animation 15s linear infinite;
}

.animation {
  stroke-dasharray: 3px 15px;
  stroke-linecap: round;
  stroke-dashoffset: 1500;
}

@keyframes arc-animation {
  to {
    stroke-dashoffset: 0;
  }
}

.arrowhead {
  stroke: blue;
  fill: blue;
  stroke-width: 1.5px !important;
}

.loader {
  -webkit-transition: height 1s;
  transition: height 1s;
  -webkit-animation: barberpole 3s linear infinite;
  animation: barberpole 10s linear infinite;
  opacity: 0;
  margin-top: -10px;
  z-index: 9999;
  height: 13px;
  width: 100%;
  background: white;
  background-size: 100px 100px;
  /*background: linear-gradient(to right,#ff2d55, #4cd964, #5ac8fa, #007aff, #34aadc, #5856d6, #ff2d55);*/
  background: linear-gradient(to right, #232b99, #aaaeeb, #232b99); /*4CD967*/
}

.loader.loading {
  opacity: 1;
}

@-webkit-keyframes barberpole {
  from {
    background-position: 0 0;
  }
  to {
    background-position: 2000px 300px;
  }
}
@keyframes barberpole {
  from {
    background-position: 0 0;
  }
  to {
    background-position: 2000px 300px;
  }
}
</style>
