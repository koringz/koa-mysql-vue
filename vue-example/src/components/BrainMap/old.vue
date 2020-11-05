<template>
  <div style="position: relative">
    <!-- <div id="mountNode"></div> -->
    <div id="container12"></div>
  </div>
</template>

<script>
// import G6 from 'assets/js/plugin/g6.js'
import G6 from '@antv/g6';

 const ICON = 'https://gw.alipayobjects.com/mdn/rms_8fd2eb/afts/img/A*0HC-SawWYUoAAAAAAAAAAABkARQnAQ';
  export default {
    name: "index",
    components: {},
    mounted() {
      // this.customG6()
      this.indentTree()
    },
    data() {
      return {
         data: {
            nodes: [{
                id: "node1",
                x: 100,
                y: 200,
				        shape: 'circle', //圆形 默认
                  label: "第一"
              }, {
                  id: "node2",
                  x: 300,
                  y: 200,
                  shape: 'rect', 		//方形
                  label: "第二"
              }, {
                  id: "node3",
                  x: 400,
                  y: 200,
                  shape: 'ellipse',	//椭圆
                    label: "第三"
                  }
            ],
            edges: [{
                source: 'node1',
                target: "node2",
                label: '你好,我好',
                style: {
                    endArrow: true
                },
                labelCfg: {
                    style: {
                        stroke: 'white',
                        lineWidth: 5	//字体和两边线段的间距
                    } 
                }
            }, {
                source: 'node2',
                target: "node3",
                label: '你好2,我好2',
                style: {
                    endArrow: true
                },
				        labelCfg: {
                    style: {
                        stroke: 'white',
                        lineWidth: 5    //字体和两边线段的间距
                    } 
                }
            }]
        }
      }
    },
    methods: {
      customG6() {
        const graph = new G6.Graph({
            container: "mountNode",
            width: 500,
            height: 800,
            modes: {
                default: ["drag-node", "drag-canvas", "click-select"]
            }
        });
        //数据渲染
        //graph.read(data)  可以拆分为  graph.data(data), graph.render();
        graph.data(this.data);	//填充数据
        graph.render(); //根据初始化数据更新视图
    
        //获取点击事件的信息
        graph.on("node:click", ev => {
            var shape = ev.target;
            var node = ev.item;
            console.log(shape);
            console.log(node);
            console.log(ev);
        })
      },
      indentTree() {
        let self = this
        const COLLAPSE_ICON = function COLLAPSE_ICON(x, y, r) {
          return [
            ['M', x, y],
            ['a', r, r, 0, 1, 0, r * 2, 0],
            ['a', r, r, 0, 1, 0, -r * 2, 0],
            ['M', x + 2, y],
            ['L', x + 2 * r - 2, y],
          ];
        };
        const EXPAND_ICON = function EXPAND_ICON(x, y, r) {
          return [
            ['M', x, y],
            ['a', r, r, 0, 1, 0, r * 2, 0],
            ['a', r, r, 0, 1, 0, -r * 2, 0],
            ['M', x + 2, y],
            ['L', x + 2 * r - 2, y],
            ['M', x + r, y - r + 2],
            ['L', x + r, y + r - 2],
          ];
        };

        G6.registerNode(
          'card-node',
          {
            draw: function drawShape(cfg, group) {
              const r = 2;
              const color = '#5B8FF9';
              const w = cfg.size[0];
              const h = cfg.size[1];
              const shape = group.addShape('rect', {
                attrs: {
                  x: -w / 2,
                  y: -h / 2,
                  width: w * 2,//200, 填充矩形文本
                  height: h * 4, // 60 填充矩形文本
                  stroke: color,
                  radius: r,
                  fill: color   // 填充文本
                },
                name: 'main-box',
                draggable: true,
              });

              group.addShape('rect', {
                attrs: {
                  x: -w / 2,
                  y: -h / 2,
                  width: w * 1.5, // 200,
                  height: h / 1, // 60
                  fill: color,
                  radius: [r, r, 0, 0],
                },
                name: 'title-box',
                draggable: true,
              });

              // title text
              group.addShape('text', {
                attrs: {
                  textBaseline: 'top',
                  x: -w / 2 + 8,
                  y: -h / 2 + 2,
                  lineHeight: 20,
                  text: cfg.id,
                  fill: '#fff',
                },
                name: 'title'
              });

              // 缩放事件
              cfg.children && group.addShape('marker', {
                attrs: {
                  x: w ,
                  y: 2,
                  r: 8,
                  cursor: 'pointer',
                  symbol: COLLAPSE_ICON,
                  stroke: '#666',
                  lineWidth: 1,
                  fill: '#fff'
                },
                name: 'collapse-icon',
              });

              // 添加事件
              cfg.children && group.addShape('marker', {
                attrs: {
                  x: w ,
                  y: 22,
                  r: 12,
                  cursor: 'pointer',
                  symbol: COLLAPSE_ICON,
                  // text: '+',
                  // stroke: '#666',
                  lineWidth: 1,
                  fill: 'blue'
                },
                name: 'add-icon',
              });

              // 删除事件
              // cfg.children && group.addShape('marker', {
              //   attrs: {
              //     x: w ,
              //     y: 40,
              //     r: 10,
              //     cursor: 'pointer',
              //     symbol: COLLAPSE_ICON,
              //     stroke: '#666',
              //     lineWidth: 1,
              //     fill: 'transparent'
              //   },
              //   name: 'delete-icon',
              // });
              
              group.addShape('text', {
                attrs: {
                  textBaseline: 'top',
                  x: -w / 2 + 8,
                  y: -h / 2 + 24,
                  lineHeight: 20,
                  text: 'description',
                  fill: 'rgba(0,0,0, 1)',
                },
                name: `description`
              });

              group.addShape('text', {
                attrs: {
                  textBaseline: 'top',
                  x: w / 1.5 + 8,
                  y: -h / 2 + 24,
                  lineHeight: 20,
                  text: cfg.label,
                  fill: 'rgba(0,0,0, 1)',
                },
                name: 'label'
              });
              
              return shape;
            },
            setState(name, value, item) {
              // if (name === 'collapsed') {
              //   const marker = item.get('group').find(ele => ele.get('name') === 'collapse-icon');
              //   const icon = value ? EXPAND_ICON : COLLAPSE_ICON
              //   marker.attr('symbol', icon);
              // }

              if(name === 'main-box') {
                let getShapeCfg = item.getOriginStyle('marker')
                if(getShapeCfg['main-box']) {
                  let nameAdd = item.get('group').find(ele => ele.get('name') === 'add-icon');
                  console.log('nameAdd',nameAdd)
                  console.log('getShapeCfg',getShapeCfg)
                  if(nameAdd) {
                    nameAdd.attr('fill', 'red')
                  }
                }
                

                // let clearCache = item.getEdges()
                // let constructor = item.getEdges()
                // let getAnchorPoints = item.getEdges()
                // let getDefaultCfg = item.getEdges()
                // let getEdges = item.getEdges()
                // let getInEdges = item.getEdges()
                // let getLinkPoint = item.getEdges()
                // let getLinkPointByAnchor = item.getEdges()
                // let getNearestPoint = item.getEdges()
                // let getNeighbors = item.getEdges()
                // let getOutEdges = item.getEdges()
              }

              console.log(name)
              if(name == 'addicon') {
                1
              }

              // debugger
            }
          }
        );

        const data = {
          id: "A",
          children: [{
            id: "A1",
            target: "node 1",
            label: '你好1,我好1',
            children: [
              { id: "A11" },
              { id: "A12" },
              { id: "A13" },
              { id: "A14" },
            ]
          }, {
            id: "A2",
            target: "node 2",
            label: '你好2,我好2',
            children: [{
              id: "A21",
              children: [
                { id: "A211" },
                { id: "A212" },
              ]
            }, {
              id: 'A22'
            }]
          }]
        };

        const width = document.getElementById('container12').scrollWidth;
        const height = document.getElementById('container12').scrollHeight || 500;

        const graph = new G6.TreeGraph({
          container: 'container12',
          width,
          height,
          defaultNode: {
            type: 'card-node',
            size: [100, 30],
            style: {
              fill: '#C6E5FF',
              stroke: '#5B8FF9',
            },
          },
          defaultEdge: {
            type: 'cubic-horizontal',
            style: {
              stroke: '#A3B1BF',
              endArrow: true
            },
          },
          layout: {
            type: 'indented',
            direction: 'LR',
            dropCap: false,
            indent: 400,
            getHeight: () => {
              return 60;
            },
          },

        });

        graph.data(data);
        graph.render();
        graph.fitView();

        let i = 0
        graph.on('mousemove', (ev)=>{
          if (ev.target.get('name') === 'main-box') {
            // debugger
            let getEdges = ev.item.getEdges()
            let get = ev.item.get('model')
            let getInEdges = ev.item.getInEdges()
            let getOutEdges = ev.item.getOutEdges()
            const point = {
              x: 100,
              y: 105,
            };
            let getLinkPoint = ev.item.getLinkPoint(point)
            get.fx= ev.x
            get.fy= ev.y
            ev.item.getModel().collapsed = !ev.item.getModel().collapsed;
            graph.setItemState(ev.item, 'main-box', ev.item.getModel().collapsed);
            
            // graph.layout();
         }
        })


        graph.on('beforeupdateitem ', (ev)=>{
            console.log(ev)
        })

        graph.on("node:click", ev => {
          console.log(ev)
          if (ev.target.get('name') === 'collapse-icon') {
            ev.item.getModel().collapsed = !ev.item.getModel().collapsed;
            graph.setItemState(ev.item, 'collapsed', ev.item.getModel().collapsed);
          }
          if (ev.target.get('name') === 'add-icon') {
            let getmodel = ev.item.getModel()
            getmodel.addevent = !getmodel.addevent
            graph.setItemState(ev.item, 'addicon', ev.item.getModel().addevent);

            this.handleAdd(graph, ev)
          }
          
          // graph.layout();
        })
      },

      handleAdd(graph, evt) {
        var item = evt.item;

        var count = 0
        var nodeId = item.get('id');
        var model = item.getModel();
        var children = model.children;
        
        // if (!children || children.length === 0) {
          var childData = {
            id: 'child-' + count,
            shape: 'rect',
            children: [{
                id: 'x-' + count
            }, {
                id: 'y-' + count
            }]
          };
          graph.addChild(childData, nodeId);
          count++;
          graph.refreshLayout();
          graph.update(item, model);
        // }
      }
    }
}
</script>

<style lang="scss" scoped>
</style>