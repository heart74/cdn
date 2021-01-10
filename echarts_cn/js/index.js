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
      left3(data);
      right3(data);

      $('.back').hide()
      $('.nowConfirm').click(function () {
        $('.back').hide()
        $('.Confirm').css("font-weight", "normal");
        center2(data);
        $('.nowConfirm').css("font-weight", "bold");
      });
      $('.Confirm').click(function () {
        $('.back').show()
        $('.nowConfirm').css("font-weight", "normal");
        center2_(data);
        $('.Confirm').css("font-weight", "bold");
      });

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
      show: true,
      top: '0%',
      left: "center",
      text: "全国现有确诊分布",
      textStyle: {
        color: "#fff",
        fontSize: 16
      }
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
      splitList: [{ end: 1 },
      { start: 1, end: 9 },
      { start: 10, end: 99 },
      { start: 100, end: 999 },
      { start: 1000, end: 9999 },],

      inRange: {

        color: ['white', 'darkred']
      },
    },

    series: [{
      name: '累计确诊人数',
      type: 'map',
      mapType: 'china',
      roam: true, //   禁用拖动和缩放

      itemStyle: { // 图形样式
        normal: {
          borderWidth: .5, //区域边框宽度
          borderColor: 'rgba(0,0,0,.5)', //区域边框颜色
          areaColor: "#ffefd5", //区域颜色

        },
        emphasis: { // 鼠标滑过地图高亮的相关设置
          borderWidth: .5,
          borderColor: '#fff',
          areaColor: "#69e1b0",
        }
      },
      label: { // 图形上的文本标签
        normal: {
          show: true, //省份名称
          color: '#000'
        },
        emphasis: {
          show: true,
          color: '#000',
        }
      },
      data: [] // [{'name': '上海', 'value': 318}, {'name': '云南', 'value': 162}]
    }]
  };

  var provinces = data.areaTree[0].children;
  for (var province of provinces) {
    option.series[0].data.push({
      'name': province.name,
      'value': province.total.nowConfirm
    });
  }

  myChart.setOption(option);
}


function center2_(data) {
  console.log(data);
  var myChart = echarts.init(document.querySelector(".map .chart"));
  $('.back').click(function () {
    if (parentInfo.length === 1) {
      return;
    }
    parentInfo.pop()
    getGeoJson(parentInfo[parentInfo.length - 1].code)
  })


  var parentJson = null
  var parentInfo = [{
    cityName: '全国',
    level: 'china',
    code: 100000
  }]
  getGeoJson(100000)



  function getGeoJson(adcode) {
    AMapUI.loadUI(['geo/DistrictExplorer'], DistrictExplorer => {
      var districtExplorer = new DistrictExplorer()
      districtExplorer.loadAreaNode(adcode, function (error, areaNode) {
        if (error) {
          console.error(error);
          return;
        }
        let Json = areaNode.getSubFeatures()
        if (Json.length > 0) {
          parentJson = Json
        } else if (Json.length === 0) {
          Json = parentJson.filter(item => {
            if (item.properties.adcode == adcode) {
              return item
            }
          })
          if (Json.length === 0) return
        }
        //去获取数据
        getMapData(Json)
      });
    })
  }

  function getInfect(province_name, level, cityName = null) {
    if (province_name == null) return 0;
    var provinces = data.areaTree[0].children; // 所有省份的疫情数据
    var province = null;  // 存放对应的省份Json
    for (var i = 0; i < provinces.length; i++) {
      if (province_name.search(provinces[i].name) != -1) {
        province = provinces[i]
        break;
      }
    }
    if (province == null) return 0;

    if (level == 'province') { // 省份
      return province.total.confirm;
    }
    else {//城市或地区
      if (cityName == null) return 0;
      var cities = province.children // 某个省份所有的地区
      if (cities.length == 1) {
        console.log(cities[0].name);
        if (cities[0].name == '地区待确认')
          return 0;
      }; // 有的地区，如香港行政区没有每个区的数据，只有“地区未确认”

      var city = null; // 存放对应city的Json
      for (var i = 0; i < cities.length; i++) {
        if (cityName.search(cities[i].name) != -1) {
          city = cities[i];
          break;
        }
      }
      if (city == null) return 0;
      return city.total.confirm
    }
  }

  function getProv(item) {
    // item 如乌鲁木齐市
    // citi 如乌鲁木齐
    hasProv = 0;
    var provinces = data.areaTree[0].children; // 所有省份的疫情数据
    if (item.properties.level == 'province') {
      return item.properties.name;
    } else { // 如果是城市
      for (var prov = 0; prov < provinces.length; prov++) {// 遍历所有省份
        var citis = provinces[prov].children; // 该省份的所有城市
        for (var citi = 0; citi < citis.length; citi++) { // 遍历该省的所有城市
          // console.log(item.properties.name);
          // console.log(citis[citi].name);
          if (item.properties.name.search(citis[citi].name) != -1) {
            return provinces[prov].name
          }
        }
      }
      // console.log('getProv city:'+ item.properties.name);
      if (hasProv == 0) return null;
    }
  }

  function getMapData(Json) {
    // console.log('Json is:');
    // console.log(Json[0]);
    console.log('getProv result is:');
    console.log(getProv(Json[0]));
    console.log(Json[0].properties.name);
    console.log(getInfect(getProv(Json[0]), Json[0].properties.level, Json[0].properties.name));
    // console.log(Json);
    let mapData = Json.map(item => {
      return ({
        name: item.properties.name,
        value: getInfect(getProv(item), item.properties.level, item.properties.name),
        level: item.properties.level,
        cityCode: item.properties.adcode
      })
    })
    let mapJson = {}
    //geoJson必须这种格式
    mapJson.features = Json

    //去渲染echarts
    initEcharts(mapData, mapJson)
  }

  function initEcharts(mapData, mapJson) {
    //注册
    echarts.registerMap('Map', mapJson);

    //这里加true是为了让地图重新绘制，不然如果你有筛选的时候地图会飞出去
    var option = {

      tooltip: {
        trigger: "item",
        formatter: p => {
          let val = p.value;
          if (window.isNaN(val)) {
            val = 0;
          }
          let txtCon =
            p.name + "<br>" + "<hr>" + "累计确诊 : " + val.toFixed(2);
          return txtCon;
        }
      },
      title: {
        show: true,
        top: '0%',
        left: "center",
        text: parentInfo[parentInfo.length - 1].cityName + "累计确诊分布",
        textStyle: {
          color: "#fff",
          fontSize: 16
        }
      },

      visualMap: { // 左侧小导航图标
        show: true,
        // x: 'left',
        // y: 'bottom',
        orient: "vertical",
        top: '60%',
        left: "left",

        textStyle: {
          fontSize: 15,
          color: '#fff',
        },
        splitList: [{
          end: 1
        },
        { start: 1, end: 9 },
        { start: 10, end: 99 },
        { start: 100, end: 999 },
        { start: 1000, end: 9999 },
        { start: 10000 }],
        inRange: {
          color: ['white', 'darkred']
        },
      },
      series: [{
        name: "地图",
        type: "map",
        map: "Map",
        roam: true, //是否可缩放
        data: mapData,
        zoom: 1.2,
        itemStyle: {
          normal: {
            show: true,

            areaColor: '#2E98CA',
            borderColor: 'rgba(0, 0, 0, .3)',
            borderWidth: '.5',
          },
        },
        label: {
          normal: {
            show: true, //显示省份标签
            textStyle: {
              color: "rgb(0, 0, 0)", //省份标签字体颜色
              // fontSize: 12
            },
            formatter: p => {
              let val = p.value;
              if (window.isNaN(val)) {
                val = 0;
              }
              //
              switch (p.name) {
                case '内蒙古自治区':
                  p.name = "内蒙古"
                  break;
                case '西藏自治区':
                  p.name = "西藏"
                  break;
                case '新疆维吾尔自治区':
                  p.name = "新疆"
                  break;
                case '宁夏回族自治区':
                  p.name = "宁夏"
                  break;
                case '广西壮族自治区':
                  p.name = "广西"
                  break;
                case '香港特别行政区':
                  p.name = "香港"
                  break;
                case '澳门特别行政区':
                  p.name = "澳门"
                  break;
                default:
                // code
              }
              if (p.name === "内蒙古自治区") {
                p.name = "内蒙古";
              }
              let txtCon =
                p.name;
              return txtCon;
            }
          },
          emphasis: {
            //对应的鼠标悬浮效果
            show: true,
            textStyle: {
              color: "#000"
            }
          }
        }
      }
      ]

    }
    myChart.setOption(option, true)

    //点击前解绑，防止点击事件触发多次
    myChart.off('click');
    myChart.on('click', echartsMapClick);
  }

  //echarts点击事件
  function echartsMapClick(params) {
    // 最多只能展开两层
    if (parentInfo.length >= 2) {
      return;
    }
    let data = params.data

    console.log('data is :');
    console.log(data);

    parentInfo.push({
      cityName: data.name,
      level: data.level,
      code: data.cityCode
    })
    getGeoJson(data.cityCode)

  }

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
  var myChart = echarts.init(document.querySelector(".right3 .chart"));

  var option = {

    color: [

      "#ed8884",
      "#ff9f7f",
      "#32c5e9",
      "#60cda0",
      "#9fe6b8",
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

    series: [
      {
        name: '省市名称',
        type: 'pie',
        radius: ["10%", "70%"],
        center: ["65%", "50%"],
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

function right3(data) {
  // var myChart = echarts.init($('#right1')[0],'dark');
  // 1实例化对象
  var myChart = echarts.init(document.querySelector(".right2 .chart"));
  const colorArray = [
    {
      top: '#4bf3ff', //蓝
      bottom: 'rgba(135,183,255,.3)'
    }, {
      top: '#4f9aff', //深蓝
      bottom: 'rgba(11,42,84,.3)'
    },
    {
      top: '#b250ff', //粉 
      bottom: 'rgba(100,255,249,.3)'
    },
    {
      top: '#ffa800', //黄
      bottom: 'rgba(248,195,248,.3)'
    }, {
      top: '#1ace4a', //绿
      bottom: 'rgba(100,255,249, 0.3)'
    },

  ];
  var option = {
    grid: {
      left: "0%",
      top: "10px",
      right: "0%",
      bottom: "4%",
      containLabel: true
    },

    color: ['pink'],
    tooltip: {
      trigger: 'axis',
      //指示器
      axisPointer: {
        type: 'shadow' // 默认为直线，可选为：'line' | 'shadow'
      }
    },
    xAxis: {

      type: 'value',
      show: false,


      axisTick: {
        // alignWithLabel: true
      },
      // 不显示x坐标轴的样式
      axisLine: {
        show: false
      },
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

    },
    yAxis: {
      type: 'category',
      //y轴字体设置
      // 不显示y轴的线
      axisLine: {
        show: false
      },
      data: [],
      // 不显示刻度
      axisTick: {
        show: false
      },
      // 把刻度标签里面的文字颜色设置为白色
      axisLabel: {
        color: "#fff"
      },
      inverse: true,

    },
    series: [{
      data: [], // [582, 300, 100],
      type: 'bar',
      // barMaxWidth: "50%",
      // barWidth: '40px',
      barCategoryGap: '50%',
      itemStyle: {
        normal: {
          show: true,
          color: function (params) {
            let num = colorArray.length;
            return {
              type: 'linear',
              colorStops: [
                {
                  offset: 0,
                  color: colorArray[params.dataIndex % num].bottom
                }, {
                  offset: 1,
                  color: colorArray[params.dataIndex % num].top
                },
                {
                  offset: 0,
                  color: colorArray[params.dataIndex % num].bottom
                }, {
                  offset: 1,
                  color: colorArray[params.dataIndex % num].top
                }, {
                  offset: 0,
                  color: colorArray[params.dataIndex % num].bottom
                }, {
                  offset: 1,
                  color: colorArray[params.dataIndex % num].top
                }, {
                  offset: 0,
                  color: colorArray[params.dataIndex % num].bottom
                }, {
                  offset: 1,
                  color: colorArray[params.dataIndex % num].top
                }, {
                  offset: 0,
                  color: colorArray[params.dataIndex % num].bottom
                }, {
                  offset: 1,
                  color: colorArray[params.dataIndex % num].top
                }]
            }
          },
          barBorderRadius: 20,
          borderWidth: 0,
          borderColor: '#333',
        }
      }
    }]
  };

  var provinces = data.areaTree[0].children;
  var topData = [];
  for (var province of provinces) {
    topData.push({
      'name': province.name,
      'value': province.total.nowConfirm
    });
  }

  // 降序排列
  topData.sort(function (a, b) {
    return b.value - a.value;
  });
  // 只保留前10条
  topData.length = 5;
  // 分别取出省份名称和数值
  for (var province of topData) {
    option.yAxis.data.push(province.name);
    option.series[0].data.push(province.value);
  }

  // console.log(topData);

  myChart.setOption(option);
}
function left1(data) {
  var myChart = echarts.init(document.querySelector(".left1 .chart"));

  var option = {

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


function left3(data) {
  var myChart = echarts.init(document.querySelector(".left3 .chart"));

  var option = {

    color: ['#cd5c5c', '#ff6347', '#fa8072', '#F2AD92', '#F9DCD1'],

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
      top: "0%",
      // 修改小图标的大小
      itemWidth: 10,
      itemHeight: 10,
      // orient: 'vertical',
      // left: 'right',
      data: [],  // ['直接访问', '邮件营销', '联盟广告', '视频广告', '搜索引擎']
      textStyle: {
        color: "rgba(255,255,255,1) ",
        fontSize: "12"
      }
    },

    series: [
      {
        name: '省市名称',
        type: 'pie',

        radius: ["40%", "60%"],
        center: ["50%", "55%"],
        minAngel: 5,
        avoidLabelOverlap: true,
        // 链接图形和文字的线条
        labelLine: {
          // length 链接图形的线条
          length: 6,
          // length2 链接文字的线条
          length2: 8
        },
        label: {
          fontSize: 12
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
    // for (var item of province.children) {
    //   if (item.name === '境外输入') {
    topData.push({
      'name': province.name,
      'value': province.today.confirm
    });

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

  myChart.setOption(option);

}



