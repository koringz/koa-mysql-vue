<template>
  <div class="echart-box">
    <div
      style=" width: 100%; height: 100%"
      ref="echarts"
      id="map-chart-div"
      @click="isDefaultCursor"
    ></div>
  </div>
</template>
<script>
//引入echarts和世界地图文件
import echarts from 'echarts'
import 'components/CityMap/worldNew.js'
import { wroldXYAll, wroldNameAll, nameMapData } from 'components/CityMap/mapXY.js'
// import { mapGetters } from 'vuex'
export default {
  // props: {
  //   mapData: Array,
  //   required: true
  // },
  computed:{
    // ...mapGetters(['navIsOpen'])
  },
  data() {
    return {
      myChart: {},
      province: '',
      wroldData: wroldXYAll(),
      mapData: [{"name":"云南","total":"32"},{"name":"四川","total":"1"},{"name":"江西","total":"5"},{"name":"福建","total":"2"}]
    }
  },
  mounted() {
    this.getChart()
    window.addEventListener('resize', this.resizeEcharts)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.resizeEcharts)
  },
  watch: {
    // lineData(value, news) {
    //   this.getChart()
    // },
    // navIsOpen(value, news) {
    //   setTimeout(()=>{
    //     this.resizeEcharts()
    //   },1000)
    // },
  },
  methods: {
    resizeEcharts() {
       this.myChart.resize()
    },
    recRrovince(val) {
      // this.$emit('getAllData',this.province)
      console.log(val)
    },
    isDefaultCursor() {
      //地图空白处清空
      let _this = this
      let mapCanvas = document.querySelector('#map-chart-div').children[0]
      let cursorStyle = mapCanvas.style.cursor
      if (cursorStyle == 'default') {
        this.myChart.dispatchAction({
          type: 'geoUnSelect',
          name: _this.nowProvinceName
        })
        _this.$emit('getAllData', '')
      }
    },
    getChart() {
      this.myChart = echarts.init(this.$refs.echarts)
      var geoCoordMap = this.wroldData
      // 小飞机的图标
      // var planePath =
      //   "path://M1705.06,1318.313v-89.254l-319.9-221.799l0.073-208.063c0.521-84.662-26.629-121.796-63.961-121.491c-37.332-0.305-64.482,36.829-63.961,121.491l0.073,208.063l-319.9,221.799v89.254l330.343-157.288l12.238,241.308l-134.449,92.931l0.531,42.034l175.125-42.917l175.125,42.917l0.531-42.034l-134.449-92.931l12.238-241.308L1705.06,1318.313z";

      var color = ['#fbfc8d']
      var series = []
      series.push({
        //地图上的起点位置
        name: '起点位置',
        type: 'effectScatter',
        coordinateSystem: 'geo',
        zlevel: 3,
        silent: false,
        legendHoverLink: true,
        hoverAnimation: false,
        effectType: 'ripple',
        showEffectOn: 'render',
        tooltip: {
          show: false,
          trigger: 'item',
          formatter: function(params) {
            return params.data.name + ':' + params.data.total
          }
        },
        rippleEffect: {
          scale: 1.2,
          brushType: 'stroke'
        },
        itemStyle: {
          normal: {
            color: '#f7d859'
          }
        },
        data: this.mapData.map(function(item) {
          if (geoCoordMap[item.name]) {
            return {
              name: item.name,
              value: geoCoordMap[item.name],
              total: item.total
            }
          }
        })
      })

      series.push({
        //气球
        name: '气球',
        type: 'scatter',
        hoverAnimation: true,
        coordinateSystem: 'geo',
        symbol: 'pin',
        symbolSize: '32',
        tooltip: {
          show: true,
          trigger: 'item',
          position: 'right',
          formatter: function(params) {
            return params.name + '：' + params.value[2]
          }
        },
        label: {
          normal: {
            show: true,
            formatter: function(params) {
              return params.value[2]
            },
            textStyle: {
              color: '#fff',
              fontSize: 12
            }
          }
        },
        itemStyle: {
          normal: {
            color: '#F62157' //标志颜色
          }
        },
        zlevel: 6,
        data: this.mapData.map(function(item) {
          if (geoCoordMap[item.name]) {
            var value = geoCoordMap[item.name].concat(item.total)
            return {
              name: item.name,
              value: value
            }
          }
        })
      })

      var option = {
        tooltip: {
          trigger: 'item',
          formatter: function(params) {
            return params.data.name + '：' + params.data.total
          }
        },
        geo: {
          type: 'map',
          map: 'world',
          roam: true,
          zoom: 1.2,
          top:'20%',
          nameMap: nameMapData,
          selectedMode: 'single',
          label: {
            position: ['50%', '50%'],
            normal: {
              show: false, // 是否显示对应地名
              textStyle: {
                position: 'bottom',
                color: '#839AB7',
                fontSize: 16
              }
            }
          },
          itemStyle: {
            normal: {
              color: '#146291',
              borderColor: '#2485b0'
            }
          },
          emphasis: {
            label: {
              textStyle: {
                color: '#dcedff'
              }
            },
            itemStyle: {
              areaColor: '#cc9966',
              borderColor: '#021933'
            }
          }
        },
        series: series
      }
      this.myChart.setOption(option, true)
      var _this = this

       
      this.myChart.on('click', function(params) {
        // if(params.name!='China'){
        //   _this.myChart.dispatchAction({
        //   type: 'geoSelect',
        //   name: params.name
        // })
        // }
        _this.nowProvinceName = params.name
        _this.$emit('getAllData', params.name)
        console.log(params)
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.echart-box {
  width: 100%;
  height: 100%;
}
.echart-box{
  height: 500px;
  width: 100%;
}
</style>
