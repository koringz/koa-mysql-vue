<template>
    <div>
        <BrainMap :actionList='actionList' :accountList='accountList' :workflowList='workflowList' :funcList='funcList'/>
    </div>
</template>

<script>
import BrainMap from 'components/BrainMap/index.vue'
export default {
    components: {
        BrainMap
    },
    data() {
        return {
            actionList: [ {
                id: 1,
                label: '123123'
            } ],
            accountList: [ {
                id: 1,
                label: '123123'
            } ],
            workflowList: [ {
                id: 1,
                label: '123123'
            } ],
            funcList: [ {
                id: 1,
                label: '123123'
            } ],
        }
    }
}
</script>

<style>

</style>