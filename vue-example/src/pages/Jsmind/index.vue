<template>
    <div>
        <Kmsjsmind />
    </div>
</template>

<script>
import Kmsjsmind from 'components/Kmsjsmind/index.vue'
export default {
    components: {
        Kmsjsmind
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