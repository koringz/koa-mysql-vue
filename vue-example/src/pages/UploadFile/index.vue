<template>
    <div>
        <file1
            :filesize="30"
            :btnName="btnlabel"
            :otherFileList="fileList"
            :filetype="config.fileUploadPromise"
            @getFileList="getFileList($event,attachType)"
            :filetypeMsg="config.fileUploadPromise.toString()"
        />
    </div>
</template>

<script>
import File1 from 'components/Upload/file1/index.vue'
export default {
    components: {
        File1,
        // file2,
        // file3
    },
    data () {
        return {
            // file1
            config: {
                fileUploadPromise: ''
            },
            fileList: [
                {
                    name: 'food.jpeg', 
                    url: 'https://fuss10.elemecdn.com/3/63/4e7f3a15429bfda99bce42a18cdd1jpeg.jpeg?imageMogr2/thumbnail/360x360/format/webp/quality/100'
                }, 
                {
                    name: 'food2.jpeg', 
                    url: 'https://fuss10.elemecdn.com/3/63/4e7f3a15429bfda99bce42a18cdd1jpeg.jpeg?imageMogr2/thumbnail/360x360/format/webp/quality/100'
                }
            ],
            btnlabel: '上传文件'
        }
    },
    methods: {
        getFileList() {
        }
    }
}
</script>

<style>

</style>