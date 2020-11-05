<template>
  <div style="position: relative">

    <!-- <behavior /> -->
    <div id="container"></div>

    <el-dialog :visible.sync="showAddBox" :close-on-click-modal="false" title="添加"  width="660px" class="self-dialog custom-dialog">
      123
      <div>
        <button @click="submitAddChild">确定</button>
      </div>
    </el-dialog>

    <el-dialog :visible.sync="showEditeChild" :close-on-click-modal="false" title="修改"  width="660px" class="self-dialog custom-dialog">
      编辑
      <div>
        <button @click="submitEditeChild">确定</button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
// import G6 from 'assets/js/plugin/g6.js'
import G6, { Graph } from '@antv/g6';

import  behavior  from "./behavior.vue";

 const ICON = 'https://gw.alipayobjects.com/mdn/rms_8fd2eb/afts/img/A*0HC-SawWYUoAAAAAAAAAAABkARQnAQ';
  export default {
    name: "index",
    components: {
      behavior
    },
    mounted() {
      this.indentTree()
    },
    data() {
      return {
          showAddBox: false,
          showEditeChild: false,
          globalGraph: {},
          currentEventTarget: {},
          data: {
            id: 'root',
            label: 'root',
            children: [
              {
                id: 'c1',
                label: 'c1',
                account: 123456,
                children: [
                  {
                    id: 'c1-1',
                    label: 'c1-1',
                  },
                  {
                    id: 'c1-2',
                    label: 'c1-2',
                    children: [
                      {
                        id: 'c1-2-1',
                        label: 'c1-2-1'
                      },
                      {
                        id: 'c1-2-2',
                        label: 'c1-2-2'
                      },
                    ]
                  },
                ]
              },
              {
                id: 'c2',
                account: 123456,
                label: 'c2'
              },
              {
                id: 'c3',
                label: 'c3',
                children: [
                  {
                    id: 'c3-1',
                    label: 'c3-1'
                  },
                  {
                    id: 'c3-2',
                    label: 'c3-2',
                    children: [
                      {
                        id: 'c3-2-1',
                        label: 'c3-2-1'
                      },
                      {
                        id: 'c3-2-2',
                        label: 'c3-2-2'
                      },
                      {
                        id: 'c3-2-3',
                        label: 'c3-2-3'
                      },
                    ]
                  },
                  {
                    id: 'c3-3',
                    label: 'c3-3'
                  },
                ]
              }
            ]
          }
      }
    },
    methods: {
      indentTree() {
        let self = this

        const COLLAPSE_ICON = function COLLAPSE_ICON(x, y, r) {
          return [
            ['M', x - r, y - r],
            ['a', r, r, 0, 1, 0, r * 2, 0],
            ['a', r, r, 0, 1, 0, -r * 2, 0],
            ['M', x + 2 - r, y - r],
            ['L', x + r - 2, y - r],
          ];
        };
        const EXPAND_ICON = function EXPAND_ICON(x, y, r) {
          return [
            ['M', x - r, y - r],
            ['a', r, r, 0, 1, 0, r * 2, 0],
            ['a', r, r, 0, 1, 0, -r * 2, 0],
            ['M', x + 2 - r, y - r],
            ['L', x + r - 2, y - r],
            ['M', x, y - 2 * r + 2],
            ['L', x, y - 2],
          ];
        };
        const DELETE_ICON = function EXPAND_ICON(x, y, r) {
          return [
              ['M', x - r, y - r],
              ['a', r, r, 0, 1, 0, r * 2, 0],
              ['a', r, r, 0, 1, 0, -r * 2, 0],
              ['M', x + 2 - r, y - r],
              ['L', x + r - 2, y - r],
          ];
        };

        G6.Util.traverseTree(this.data, d => {
          d.leftIcon = {
            style: {
              fill: '#fff',
              stroke: '#555'
            },
            img: 'https://img.icons8.com/fluent/96/home.png'
          }
          return true
        })

        G6.registerNode('icon-node', {
          options: {
            size: [60, 20],
            stroke: 'red',
            fill: 'red'
          },
          draw(cfg, group) {
            const styles = this.getShapeStyle(cfg)
            const { labelCfg = {} } = cfg

            const keyShape = group.addShape('rect', {
              attrs: {
                ...styles,
                x: 0,
                y: 0
              }
            })

            /**
             * leftIcon 格式如下：
             *  {
             *    style: ShapeStyle;
             *    img: ''
             *  }
             */
            console.log('cfg.leftIcon', cfg.leftIcon);
            if (cfg.leftIcon) {
              const { style, img } = cfg.leftIcon
              group.addShape('rect', {
                attrs: {
                  x: 1,
                  y: 1,
                  width: 38,
                  height: styles.height - 2,
                  fill: '#666',
                  ...style
                }
              })

              // 左侧图标
              group.addShape('image', {
                attrs: {
                  x: 8,
                  y: 8,
                  width: 24,
                  height: 24,
                  img: img || 'https://www.easyicon.net/api/resizeApi.php?id=1137203&size=128',
                },
                name: 'image-shape',
              });
            }

            // 如果不需要动态增加或删除元素，则不需要 add 这两个 marker
            group.addShape('marker', {
              attrs: {
                x: 40,
                y: 52,
                r: 6,
                stroke: '#73d13d',
                cursor: 'pointer',
                symbol: EXPAND_ICON
              },
              name: 'add-item'
            })

            // 删除图标
            group.addShape('marker', {
              attrs: {
                x: 80,
                y: 52,
                r: 6,
                stroke: '#ff4d4f',
                cursor: 'pointer',
                symbol: COLLAPSE_ICON
              },
              name: 'remove-item'
            })

            // 修改图标
             group.addShape('marker', {
              attrs: {
                x: 20,
                y: 52,
                r: 6,
                stroke: '#73d13d',
                cursor: 'pointer',
                symbol: DELETE_ICON
              },
              name: 'edite-item'
            })

            if (cfg.label) {
              group.addShape('text', {
                attrs: {
                  ...labelCfg.style,
                  text: `名称:${cfg.label}`,
                  x: 50,
                  y: 25,
                },
                name: 'text-name'
              })
            }
            if (cfg.account) {
              group.addShape('text', {
                attrs: {
                  ...labelCfg.style,
                  text: `账号:${cfg.account}`,
                  x: 50,
                  y: 35,
                },
                name: 'text-account'
              })
            }

            return keyShape
          },
          setState(name, value, item) {
            if(name === 'edite-item-list') {
              let getShapeCfg = item.getOriginStyle('text')
              let getModel = item.getModel()
              let node = self.globalGraph.findById(getModel.id)
              let getContainer = item.getContainer()
              const state = item.getStates();
              console.log(node)
              console.log(getModel)
              console.log(getContainer)
              console.log(state)
              self.showEditeChild = false
            }

          }
        }, 'rect')

        G6.registerEdge('flow-line', {
          draw(cfg, group) {
            const startPoint = cfg.startPoint;
            const endPoint = cfg.endPoint;

            const { style } = cfg
            const shape = group.addShape('path', {
              attrs: {
                stroke: style.stroke,
                endArrow: style.endArrow,
                path: [
                  ['M', startPoint.x, startPoint.y],
                  ['L', startPoint.x, (startPoint.y + endPoint.y) / 2],
                  ['L', endPoint.x, (startPoint.y + endPoint.y) / 2,],
                  ['L', endPoint.x, endPoint.y],
                ],
              },
            });

            return shape;
          }
        });

        const defaultStateStyles = {
          hover: {
            stroke: '#1890ff',
            lineWidth: 2
          }
        }

        const defaultNodeStyle = {
          fill: '#aaa',
          stroke: '#40a9ff',
          radius: 5
        }

        const defaultEdgeStyle = {
          stroke: '#aaa',
          endArrow: {
            path: 'M 0,0 L 12, 6 L 9,0 L 12, -6 Z',
            fill: '#aaa',
            d: -20
          }
        }

        const defaultLayout = {
          type: 'compactBox',
          direction: 'TB',
          getId: function getId(d) {
            return d.id;
          },
          getHeight: function getHeight() {
            return 16;
          },
          getWidth: function getWidth() {
            return 16;
          },
          getVGap: function getVGap() {
            return 40;
          },
          getHGap: function getHGap() {
            return 70;
          },
        }

        const defaultLabelCfg = {
          style: {
            fill: '#000',
            fontSize: 12
          }
        }

        const docElement = document.getElementById('container')
        const width = docElement.scrollWidth;
        const height = docElement.scrollHeight || 500;

        const minimap = new G6.Minimap({
          size: [150, 100]
        })

        const graph = new G6.TreeGraph({
          container: 'container',
          width,
          height,
          linkCenter: true,
          // plugins: [minimap],
          modes: {
            default: [
              'click-add-edge', 
              'click-select',
              'drag-canvas',
              'zoom-canvas',
            ],
          },
          defaultNode: {
            type: 'icon-node',
            size: [120, 40],
            style: defaultNodeStyle,
            labelCfg: defaultLabelCfg
          },
          defaultEdge: {
            type: 'flow-line',
            style: defaultEdgeStyle,
          },
          nodeStateStyles: defaultStateStyles,
          edgeStateStyles: defaultStateStyles,
          layout: defaultLayout
        });

        // 画交互线
        let addedCount = 0;
        G6.registerBehavior('click-add-edge', {
            getEvents() {
                return {
                'node:click': 'onClick',
                mousemove: 'onMousemove',
                'edge:click': 'onEdgeClick' // 点击空白处，取消边
                };
            },
            onClick(ev) {
                const node = ev.item;
                const graph = this.graph;
                const point = {
                    x: ev.x,
                    y: ev.y,
                    stroke: '#B2B',
                    lineWidth: 1,
                };
                const model = node.getModel();
                if (this.addingEdge && this.edge) {
                  graph.updateItem(this.edge, {
                      target: model.id
                  });
                  // graph.setItemState(this.edge, 'selected', true);
                  this.edge = null;
                  this.addingEdge = false;
                } else {
                  this.edge = graph.addItem('edge', {
                      source: model.id,
                      target: point
                  });
                  this.addingEdge = true;
                }
            },
            onMousemove(ev) {
                const point = {
                    x: ev.x,
                    y: ev.y
                };
                if (this.addingEdge && this.edge) {
                this.graph.updateItem(this.edge, {
                    target: point
                });
                }
            },
            onEdgeClick(ev) {
                const currentEdge = ev.item;
                // 拖拽过程中，点击会点击到新增的边上
                if (this.addingEdge && this.edge == currentEdge) {
                  graph.removeItem(this.edge);
                  this.edge = null;
                  this.addingEdge = false;
                }
            }
        });

        graph.data(this.data);
        graph.render();
        graph.fitView();
        graph.setMode('addEdge');


        graph.on('node:mouseenter', evt => {
          const { item } = evt
          graph.setItemState(item, 'hover', true)
        })

        graph.on('node:mouseleave', evt => {
          const { item } = evt
          graph.setItemState(item, 'hover', false)
        })

        graph.on('node:click', evt => {
          const { item, target } = evt
          const targetType = target.get('type')
          const name = target.get('name')

          // 增加元素
          if (targetType === 'marker') {
            const model = item.getModel()
            if (name === 'add-item') {
              if (!model.children) {
                model.children = []
              }
              const id = `n-${Math.random()}-${Math.random()}`;
              model.children.push({
                id,
                label: id.slice(0,7),
                account:  `6879`,
                leftIcon: {
                  style: {
                    fill: '#e6fffb',
                    stroke: '#e6fffb'
                  },
                  img: 'https://www.easyicon.net/api/resizeApi.php?id=1137203&size=128'
                }
              })
              self.handleAddTwo.call(self, graph, model)
              // graph.updateChild(model, model.id)
            } else if (name === 'remove-item') {
              graph.removeChild(model.id)
            } else if (name === 'edite-item') {
              self.handleEditeChild.call(self, graph, model, evt)
              console.log(graph)
            }
          }
        })
      },

      // 添加项 start
      handleAddTwo (graph, model) {
        this.showAddBox = true
        this.globalGraph = graph
        this.globalModel = model
        console.log(model)
      },
      submitAddChild() {
        this.showAddBox = false
        this.globalGraph.updateChild(this.globalModel, this.globalModel.id)
      },

      // 处理编辑
      handleEditeChild(graph, model, evt) {
        this.currentEventTarget = evt
        this.showEditeChild = true
        this.globalGraph = graph
        this.globalModel = model
        console.log(model)
      },
      submitEditeChild() {
        this.editeData = {
          a: 1,
          b: 2
        }
        this.globalGraph.setItemState(this.currentEventTarget.item, 'edite-item-list', true)
        this.showEditeChild = false

        // let getModel = item.getModel()
        // let node = this.globalGraph.findById(this.globalModel.id)
        let node = this.currentEventTarget.item;
        const model = node.getModel();
        model.oriLabel = model.label;
          
        this.globalGraph.updateItem(node, {
          label: '名称:fsdafdsf',
          text: '名称:fsdafdsf',
          labelCfg: {
            style: {
              fill: '#003a8c',
            },
          },
        })


        // 获得矩形的方法
        let shape = node.get('keyShape');
        shape.attr({
          x: 0,
          y: 0,
        });


        this.globalGraph.refresh();
        // this.globalGraph.render();


      },

      // 增加
      handleAdd(graph, evt) {
        var item = evt.item;

        var count = 0
        var nodeId = item.get('id');
        var model = item.getModel();
        var children = model.children;
        
        // if (!children || children.length === 0) {
          var childData = {
            id: 'child-' + count,
            children: [{
                id: 'x-' + count
            }, {
                id: 'y-' + count
            }]
          };
          graph.addChild(childData, nodeId);
          count++;
          graph.updateChild(model, model.id)
        // }
      }
    }
}
</script>

<style lang="scss" scoped>
</style>