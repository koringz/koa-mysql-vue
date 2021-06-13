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
import pa from '@/assets/images/pa.jpg'
import wind from '@/assets/images/wind.jpg'

Vue.use(Viewer, {
    defaultOptions: {
        zIndex: 9999,
    }
})

export default {
    data () {
        return {
            images: [
                pa,
                wind
            ],
            other: []
        }
    }
} 
</script>
<style scoped>
img{
    margin-right: 24px
}
.view-title{
    padding: 20px 0;
}
</style>