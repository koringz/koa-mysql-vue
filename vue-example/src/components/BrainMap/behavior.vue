<template>
  <div style="position: relative">
    <div id="mountNode"></div>
  </div>
</template>

<script>
// import G6 from 'assets/js/plugin/g6.js'
import G6 from '@antv/g6'

const ICON =
  'https://gw.alipayobjects.com/mdn/rms_8fd2eb/afts/img/A*0HC-SawWYUoAAAAAAAAAAABkARQnAQ'
export default {
  name: 'index',
  components: {},
  mounted() {
    // this.customG6()
    this.customG6()
  },
  data() {
    return {}
  },
  methods: {
    customG6() {
      
        const data = {
            nodes: [{
                id: 'node1',
                x: 100,
                y: 200
            },{
                id: 'node2',
                x: 300,
                y: 200
            },{
                id: 'node3',
                x: 300,
                y: 300
            }],
            edges: [{
                id: 'edge1',
                target: 'node2',
                source: 'node1'
            }]
        };

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
                    y: ev.y
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

        //     // Register a custom behavior to add node
        // G6.registerBehavior('click-add-node', {
        //     getEvents() {
        //         return {
        //         'canvas:click': 'onClick'
        //         };
        //     },
        //     onClick(ev) {
        //         const graph = this.graph;
        //         const node = this.graph.addItem('node', {
        //         x: ev.canvasX,
        //         y: ev.canvasY,
        //         id: `node-${addedCount}`, // 生成唯一的 id
        //         });
        //         addedCount++;
        //     }
        // });

        const graph = new G6.Graph({
            container: 'mountNode',
            width: 500,
            height: 500,
            modes: {
                // default: ['drag-node', 'click-select'],
                // addNode: ['click-add-node', 'click-select'],
                addEdge: ['click-add-edge', 'click-select']
            },
            // The node styles in different states
        });

        graph.data(data);
        graph.render();

        graph.setMode('addEdge');
    },
  },
}
</script>

<style lang="scss" scoped>
</style>