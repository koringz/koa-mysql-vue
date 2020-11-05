<template>
    <div class="view-zoom-img">
        <div class="view-box">
            <h1 class="view-title">默认显示</h1>
            <viewer :images="images">
                <img v-for="src in images" :src="src" :key="src" width="200">
            </viewer>
        </div>
        <div class="view-box">
            <h1 class="view-title">其他显示</h1>
            <viewer :images="images" v-if="other.length">
                <img v-for="src in other" :src="src" :key="src" width="300">
            </viewer>
        </div>
    </div>
</template>

<script>
import Vue from 'vue'
import Viewer from 'v-viewer'
import 'viewerjs/dist/viewer.css'

Vue.use(Viewer, {
    defaultOptions: {
        zIndex: 9999,
    }
})

export default {
    data () {
        return {
            images: [
                'https://ss0.bdstatic.com/94oJfD_bAAcT8t7mm9GUKT-xh_/timg?image&quality=100&size=b4000_4000&sec=1591851097&di=1abf98bf8bddbcbd3e4da41f9282cb5c&src=http://img01.mopimg.cn/nanning/forum/201402/14/154032f6311g5b63546b1b.jpg',
                'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1591861181581&di=450264df9ea97e35a6ec8ab60f530d65&imgtype=0&src=http%3A%2F%2Fimg.pconline.com.cn%2Fimages%2Fupload%2Fupc%2Ftx%2Fwallpaper%2F1205%2F22%2Fc0%2F11704482_1337657341929.jpg'
            ],
            other: []
        }
    }
} 
</script>
<style>
img{
    margin-right: 100px
}
.view-title{
    padding: 20px 0;
}
</style>