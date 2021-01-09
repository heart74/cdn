/**
 *  实时显示时间
 */
function showTime() {
  var time = new Date();
  var year = time.getFullYear();
  var month = (time.getMonth() + 1 + '').padStart(2, '0');
  var day = (time.getDate() + '').padStart(2, '0');
  var hour = (time.getHours() + '').padStart(2, '0');
  var minute = (time.getMinutes() + '').padStart(2, '0');
  var second = (time.getSeconds() + '').padStart(2, '0');

  var content = `${year}年${month}月${day}日 ${hour}:${minute}:${second}`;
  $('#title .time').text(content);
}

showTime();
setInterval(showTime, 1000); // 每秒执行一次


/**
*  向腾讯发送请求，获取数据
*/
function getData() {
  $.ajax({
    url: 'https://view.inews.qq.com/g2/getOnsInfo?name=disease_h5',
    data: {
      name: 'disease_h5'
    },
    dataType: 'jsonp',
    success: function (res) {
      // console.log(res.data);
      var data = JSON.parse(res.data);
      console.log(data);

      center1(data);
      center2(data);
      right1(data);
      right2(data);
    }
  });

  $.ajax({
    type: 'post',
    url: 'https://api.inews.qq.com/newsqa/v1/query/inner/publish/modules/list',
    data: {
      modules: 'chinaDayList,chinaDayAddList,cityStatis,nowConfirmStatis,provinceCompare'
    },
    dataType: 'json',
    success: function (res) {
      console.log(res.data);
      var data = res.data;

      left1(data);
      left2(data);
    }
  });
}

getData();
setInterval(getData, 5 * 60 * 1000); // 每5分钟自动获取数据


function center1(data) {
  $('#confirm').text(data.chinaTotal.confirm);
  $('#heal').text(data.chinaTotal.heal);
  $('#dead').text(data.chinaTotal.dead);
  $('#nowConfirm').text(data.chinaTotal.nowConfirm);
  $('#noInfect').text(data.chinaTotal.noInfect);
  $('#import').text(data.chinaTotal.importedCase);
}

function center2(data) {
  // var myChart = echarts.init($('#center2')[0],'dark');
  var myChart = echarts.init(document.querySelector(".map .chart"));

  var option = {
    title: {
      text: '',
    },
    tooltip: {
      trigger: 'item'
    },
    visualMap: { // 左侧小导航图标
      show: true,
      // x: 'left',
      // y: 'bottom',
      orient: "vertical",
      top: '70%',
      left: "left",

      textStyle: {
        fontSize: 15,
        color: '#fff',
      },
      splitList: [{ start: 1, end: 9 },
      { start: 10, end: 99 },
      { start: 100, end: 999 },
      { start: 1000, end: 9999 },
      { start: 10000 }],
      // color: ['#8A3310', '#C64918', '#E55B25', '#F2AD92', '#F9DCD1']
      // color:['#08306b','#cacacb','#3f8fc5','#7db8da','#bfd8ed']
      color: ['#3f8fc5', '#45A5F8', '#8AC6FD', '#B2CAE0', '#D2EAFF'],
    //   inRange: {
    //     // color: ['#4A235A','#F4ECF7']
    //     color:['#D2EAFF','#3f8fc5']
    // },
    },
  
    series: [{
      name: '累计确诊人数',
      type: 'map',
      mapType: 'china',
      roam: true, //   禁用拖动和缩放

      itemStyle: { // 图形样式
        normal: {
          borderWidth: 1, //区域边框宽度
          borderColor: '#fff', //区域边框颜色
          areaColor: "#ffefd5", //区域颜色
          // borderColor: "#112b3b", //省市边界线
          // borderColor: "#a7e4e6", //省市边界线
          shadowColor: 'rgba(166, 230, 236, 0.6)',
          shadowOffsetX: 0,
          shadowOffsetY: 0,
          shadowBlur: 120
        },
        emphasis: { // 鼠标滑过地图高亮的相关设置
          borderWidth: 1,
          borderColor: '#fff',
          areaColor: "#69e1b0",
        }
      },
      label: { // 图形上的文本标签
        normal: {
          show: true, //省份名称
          color: '#fff'
        },
        emphasis: {
          show: true,
          color: '#fff',
        }
      },
      data: [] // [{'name': '上海', 'value': 318}, {'name': '云南', 'value': 162}]
    }]
  };

  var provinces = data.areaTree[0].children;
  for (var province of provinces) {
    option.series[0].data.push({
      'name': province.name,
      'value': province.total.confirm
    });
  }

  myChart.setOption(option);
}

function right1(data) {
  // var myChart = echarts.init($('#right1')[0],'dark');
  // 1实例化对象
  var myChart = echarts.init(document.querySelector(".right1 .chart"));

  var option = {
    grid: {
      left: "0%",
      top: "10px",
      right: "0%",
      bottom: "4%",
      containLabel: true
    },

    color: ['#3398DB'],
    tooltip: {
      trigger: 'axis',
      //指示器
      axisPointer: {
        type: 'shadow' // 默认为直线，可选为：'line' | 'shadow'
      }
    },
    xAxis: {
      type: 'category',
      data: [], // ['湖北','广州','北京']
      // 修改刻度标签 相关样式
      axisLabel: {
        color: "rgba(255,255,255,1) ",
        fontSize: "12"
      },
      axisTick: {
        alignWithLabel: true
      },
      // 不显示x坐标轴的样式
      axisLine: {
        show: false
      },

    },
    yAxis: {
      type: 'value',
      //y轴字体设置
      axisLabel: {
        show: true,
        color: 'white',
        fontSize: 12,
        formatter: function (value) {
          if (value >= 1000) {
            value = value / 1000 + 'k';
          }
          return value;
        }
      },
      // y轴的线条改为了 2像素
      axisLine: {
        lineStyle: {
          color: "rgba(255,255,255,.1)",
          width: 2
        }
      },
      // y轴分割线的颜色
      splitLine: {
        lineStyle: {
          color: "rgba(255,255,255,.1)"
        }
      }

    },
    series: [{
      data: [], // [582, 300, 100],
      type: 'bar',
      barMaxWidth: "50%",
      itemStyle: {
        // 修改柱子圆角
        barBorderRadius: 5
      }
    }]
  };

  var provinces = data.areaTree[0].children;
  var topData = [];
  for (var province of provinces) {
    topData.push({
      'name': province.name,
      'value': province.total.confirm
    });
  }

  // 降序排列
  topData.sort(function (a, b) {
    return b.value - a.value;
  });
  // 只保留前10条
  topData.length = 10;
  // 分别取出省份名称和数值
  for (var province of topData) {
    option.xAxis.data.push(province.name);
    option.series[0].data.push(province.value);
  }

  // console.log(topData);

  myChart.setOption(option);
}

function right2(data) {
  var myChart = echarts.init(document.querySelector(".right2 .chart"));

  var option = {
    // title: {
    //     text: '境外输入省市TOP5',
    //     left: 'center'
    // },
    color: [
      // "#006cff",
      "#60cda0",
      "#ed8884",
      "#ff9f7f",
      "#0096ff",
      "#9fe6b8",
      "#32c5e9",
      // "#1d9dff"
    ],
    grid: {
      left: "0%",
      top: "0px",
      right: "0%",
      bottom: "4%",
      containLabel: true
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b} : {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      data: [],  // ['直接访问', '邮件营销', '联盟广告', '视频广告', '搜索引擎']
      textStyle: {
        color: "rgba(255,255,255,1) ",
        fontSize: "12"
      }
    },
    // legend: {
    //   bottom: "0%",
    //   itemWidth: 10,
    //   itemHeight: 10,
    //   ,
    //   textStyle: {
    //     color: "rgba(255,255,255,.5)",
    //     fontSize: "12"
    //   }
    // },
    series: [
      {
        name: '省市名称',
        type: 'pie',
        radius: ["10%", "70%"],
        center: ["50%", "50%"],
        roseType: "radius",
        // 链接图形和文字的线条
        labelLine: {
          // length 链接图形的线条
          length: 6,
          // length2 链接文字的线条
          length2: 8
        },
        data: [],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  };

  var provinces = data.areaTree[0].children;
  var topData = [];
  for (var province of provinces) {
    for (var item of province.children) {
      if (item.name === '境外输入') {
        topData.push({
          'name': province.name,
          'value': item.total.confirm
        });
        break;
      }
    }
  }
  // 降序排列
  topData.sort(function (a, b) {
    return b.value - a.value;
  });
  // 只保留前5条
  topData.length = 5;
  // 分别取出省份名称和数据
  for (var province of topData) {
    option.legend.data.push(province.name);
    option.series[0].data.push(province);
  }

  // console.log(topData);

  myChart.setOption(option);

}

function left1(data) {
  var myChart = echarts.init(document.querySelector(".left1 .chart"));

  var option = {
    // title: {
    //     text: "全国累计趋势",
    //     textStyle: {
    //         color: 'white',
    //     },
    //     left: 'left',
    // },
    // 通过这个color修改两条线的颜色
    color: ["#00f2f1", "#ed3f35", "#0096ff"],
    grid: {
      left: "0%",
      top: "10px",
      right: "0%",
      bottom: "4%",
      containLabel: true
    },
    tooltip: {
      trigger: 'axis',
      //指示器
      axisPointer: {
        type: 'line',
        lineStyle: {
          color: '#7171C6'
        }
      },
    },
    //图例
    legend: {
      data: ['累计确诊', "累计治愈", "累计死亡"],
      left: "right",
      textStyle: {
        color: "#4c9bfd",
        fontSize: "12"
      }
    },
    //图形位置
    grid: {
      left: '4%',
      right: '6%',
      bottom: '4%',
      top: 50,
      containLabel: true
    },
    xAxis: [{
      type: 'category',
      data: [],//['03.20', '03.21', '03.22']
      axisLabel: {
        // color: "rgba(255,255,255,1) ",
        fontSize: "12",
        color: "white" // 文本颜色
      },
      axisTick: {
        show: false // 去除刻度线
      },
      axisLine: {
        show: false // 去除轴线
      }
    }],
    yAxis: [{
      type: 'value',
      //y轴字体设置
      axisLabel: {
        show: true,
        color: "white", // 文本颜色
        fontSize: 12,
        formatter: function (value) {
          if (value >= 1000) {
            value = value / 1000 + 'k';
          }
          return value;
        }
      },
      //y轴线设置显示
      axisLine: {
        show: false
      },
      //与x轴平行的线样式
      splitLine: {
        show: true,
        lineStyle: {
          color: '#012f4a',
          // width: 1,
          // type: 'solid',
        }
      }
    }],
    series: [{
      name: "累计确诊",
      type: 'line',
      smooth: true,
      data: []//[260, 406, 529]
    }, {
      name: "累计治愈",
      type: 'line',
      smooth: true,
      data: []//[25, 25, 25]
    }, {
      name: "累计死亡",
      type: 'line',
      smooth: true,
      data: []//[6, 9, 17]
    }]
  };

  var chinaDayList = data.chinaDayList;
  for (var day of chinaDayList) {
    option.xAxis[0].data.push(day.date);
    option.series[0].data.push(day.confirm);
    option.series[1].data.push(day.heal);
    option.series[2].data.push(day.dead);
  }


  myChart.setOption(option);
}

function left2(data) {
  var myChart = echarts.init(document.querySelector(".left2 .chart"));

  var option = {
    // title: {
    //     text: '全国新增趋势',
    //     textStyle: {
    //         color: 'white',
    //     },
    //     left: 'left',
    // },
    grid: {
      left: "0%",
      top: "10px",
      right: "0%",
      bottom: "4%",
      containLabel: true
    },
    tooltip: {
      trigger: 'axis',
      //指示器
      axisPointer: {
        type: 'line',
        lineStyle: {
          color: '#7171C6'
        }
      },
    },
    //图例
    legend: {
      data: ['新增确诊', '新增疑似', '新增境外输入'],
      left: 'right',
      textStyle: {
        color: "rgba(255,255,255,1) ",
        fontSize: "12"
      }
    },
    //图形位置
    grid: {
      left: '4%',
      right: '6%',
      bottom: '4%',
      top: 50,
      containLabel: true
    },
    xAxis: [{
      type: 'category',
      data: [], // ['03.20', '03.21', '03.22']
      axisLabel: {
        color: "rgba(255,255,255,1) ",
        fontSize: "12"
      }
    }],
    yAxis: [{
      type: 'value',
      //y轴字体设置
      axisTick: { show: false },
      axisLabel: {
        show: true,
        color: 'white',
        fontSize: 12,
        formatter: function (value) {
          if (value >= 1000) {
            value = value / 1000 + 'k';
          }
          return value;
        }
      },
      //y轴线设置显示
      axisLine: {
        show: true
      },
      // 修改分割线的颜色
      splitLine: {
        lineStyle: {
          color: "rgba(255,255,255,.1)"
        }
      }
    }],
    series: [{
      name: '新增确诊',
      type: 'line',
      smooth: true,
      lineStyle: {
        color: "#0184d5",
        width: "2"
      },
      // 填充颜色设置
      areaStyle: {
        color: new echarts.graphic.LinearGradient(
          0,
          0,
          0,
          1,
          [
            {
              offset: 0,
              color: "rgba(1, 132, 213, 0.4)" // 渐变色的起始颜色
            },
            {
              offset: 0.8,
              color: "rgba(1, 132, 213, 0.1)" // 渐变线的结束颜色
            }
          ],
          false
        ),
        shadowColor: "rgba(0, 0, 0, 0.1)"
      },
      // 设置拐点
      symbol: "circle",
      // 拐点大小
      symbolSize: 8,
      // 开始不显示拐点， 鼠标经过显示
      showSymbol: false,
      // 设置拐点颜色以及边框
      itemStyle: {
        color: "#0184d5",
        borderColor: "rgba(221, 220, 107, .1)",
        borderWidth: 12
      },
      data: [] // [20, 406, 529]
    }, {
      name: '新增疑似',
      type: 'line',
      smooth: true,
      lineStyle: {
        normal: {
          color: "#00d887",
          width: 2
        }
      },
      areaStyle: {
        normal: {
          color: new echarts.graphic.LinearGradient(
            0,
            0,
            0,
            1,
            [
              {
                offset: 0,
                color: "rgba(0, 216, 135, 0.4)"
              },
              {
                offset: 0.8,
                color: "rgba(0, 216, 135, 0.1)"
              }
            ],
            false
          ),
          shadowColor: "rgba(0, 0, 0, 0.1)"
        }
      },
      // 设置拐点 小圆点
      symbol: "circle",
      // 拐点大小
      symbolSize: 5,
      // 设置拐点颜色以及边框
      itemStyle: {
        color: "#00d887",
        borderColor: "rgba(221, 220, 107, .1)",
        borderWidth: 12
      },
      // 开始不显示拐点， 鼠标经过显示
      showSymbol: false,
      data: [] // [25, 75, 122]
    }, {
      name: '新增境外输入',
      type: 'line',
      smooth: true,
      lineStyle: {
        normal: {
          color: "#6c50f3",
          width: 2
        }
      },
      areaStyle: {
        normal: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
            offset: 0,
            color: 'rgba(108,80,243,0.3)'
          },
          {
            offset: 1,
            color: 'rgba(108,80,243,0)'
          }
          ], false),
          shadowColor: 'rgba(108,80,243, 0.9)',
          shadowBlur: 20
        }
      },
      // 设置拐点 小圆点
      symbol: "circle",
      // 拐点大小
      symbolSize: 5,
      // 设置拐点颜色以及边框
      itemStyle: {
        color: "#6c50f3",
        borderColor: "rgba(221, 220, 107, .1)",
        borderWidth: 12
      },
      // 开始不显示拐点， 鼠标经过显示
      showSymbol: false,
      data: [] // [25, 75, 122]
    }]
  };

  var chinaDayAddList = data.chinaDayAddList;
  for (var day of chinaDayAddList) {
    option.xAxis[0].data.push(day.date);
    option.series[0].data.push(day.confirm);
    option.series[1].data.push(day.suspect);
    option.series[2].data.push(day.importedCase);
  }

  myChart.setOption(option);
}
