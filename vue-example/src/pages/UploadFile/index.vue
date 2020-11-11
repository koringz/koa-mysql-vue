<template>
    <div>
        <file1
            :filesize="30"
            v-if="fileList.length"
            :btnName="btnlabel"
            :otherFileList="fileList"
            @getFileList="getFileList($event)"
            :filetype="config.fileUploadPromise"
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
    created() {
        this.handleFileList()
    },
    methods: {
        getFileList() {
        },
        arrayBufferToBase64 (buffer) {
            var binary = ''
            var bytes = new Uint8Array(buffer)
            var len = bytes.byteLength
            for (var i = 0; i < len; i++) {
                binary += String.fromCharCode(bytes[i])
            }
            return window.btoa(binary)
        },
        handleFileList() {
            let page_index = 1
            let page_size = 1
            
            let params = { page_index, page_size }
            this.$api.api_access_file(params)
            .then(res => {
                if (res.data.code) {
                    this.getFiles(res.data.data)
                }
            }) .catch(error => console.log(error))
        },
        getFiles(dataValue) {
            dataValue = dataValue[0].name
            this.$api.api_download_file({filename: dataValue})
            .then(res => {
                let DATA = res.data.data
                let type  = DATA.type
                let transferBuffer = this.arrayBufferToBase64(DATA.data)
                let src = 'data:image/jpeg;base64,' + transferBuffer
                let fileList = []
                fileList.push({
                    name: null,
                    url:  src
                })
                this.fileList = fileList
            })
        }
    }
}
</script>

<style>

</style>