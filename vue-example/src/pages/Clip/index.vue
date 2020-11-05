<template>
  <div>
    <button class="btn feut-clipboard-btn" :data-clipboard-text="`${clipboardContent}`">
        {{clipboardContent}}
        <br/>
        <br/>
        <button @click="clipContent">点击复制 Copy to clipboard</button>
    </button>
  </div>
</template>

<script>
import ClipboardJS from 'clipboard'
export default {
    data() {
        return {
            clipboardContent: `
            第二个趋势是Web前后端融合为全栈开发。Node.js已经给前端开发很好地开了个头，这个头就是让前端人员了解HTTP协议的细节，了解常规的API开发。我相信很多人已经看明白了，为什么我们要做前后端分离，这里面主要原因除了代码开发部署上的分离，还有一部分是让不懂HTTP协议的人不要在接口层瞎鼓捣，因为这里面细节太多了，你都不了解HTTP缓存，你怎么知道哪个API的HTTP header应该用什么呢。因此了解HTTP协议的前端，会慢慢吃掉这部分后端开发的任务，而了解HTTP协议的后端，也会因为三大框架开发模式的成熟而学会前端开发。进而，这些两类人演化为全栈开发。
            `
        }
    },
    monted() {
    },
    methods: {
        clipContent() {
            let clipboard = new ClipboardJS('.btn');
            let self = this
                this.$message('22')

            clipboard.on('success', function(e) {
                console.info('Action:', e.action);
                console.info('Text:', e.text);
                console.info('Trigger:', e.trigger);
                e.clearSelection();
            });

            clipboard.on('error', function(e) {
                console.error('Action:', e.action);
                console.error('Trigger:', e.trigger);
            });
        }
    }
}
</script>

<style>
.feut-clipboard-btn{
    background-color: transparent;
    border: none;
    color: #6a88b5;
}
</style>