<template>
    <div class="feut-manager-message">
        <h1>管理信息</h1>
        <ul class="feut-manager-message-ul">
            <li class="feut-manager-message-text">
                <span class="feut-manager-message-lable">姓名</span>
                <span class="feut-manager-message-content">zhangsanzhangsanzhangsanzhangsan</span>
            </li>
            <li class="feut-manager-message-text">
                <span class="feut-manager-message-lable">代码演示</span>
                <span class="feut-manager-message-content">要初始化一个Area组件，你需要传入一个area-list属性，数据格式具体可看下面数据格式章节</span>
            </li>
            <li class="feut-manager-message-text">
                <span class="feut-manager-message-lable">选中省市区</span>
                <span class="feut-manager-message-content">如果想选中某个省市区，需要传入一个value属性，绑定对应的省市区code</span>
            </li>
            <li class="feut-manager-message-text">
                <span class="feut-manager-message-lable">配置显示列</span>
                <span class="feut-manager-message-content">可以通过columns-num属性配置省市区显示的列数，默认情况下会显示省市区，当你设置为2，则只会显示省市选择</span>
            </li>
            <li class="feut-manager-message-text">
                <span class="feut-manager-message-lable">列占位提示文字</span>
                <span class="feut-manager-message-content">可以通过columns-placeholder属性配置每一列的占位提示文字</span>
            </li>
        </ul>
    </div>
</template>

<script>
export default {

}
</script>

<style scoped>
.feut-manager-message{
    margin: 0 auto;
    padding: 22px 38px;
    width: 600px;
    background-color: #0d1623;
}
.feut-manager-message h1{
    line-height: 44px;
    text-align: center;
    font-size: 22px;
    font-weight: 600;
}
.feut-manager-message-ul{
    width: ;
}
.feut-manager-message-text{
    display: flex;
    justify-content: space-between;
    line-height: 44px;
    font-size: 16px;
}
.feut-manager-message-lable{
    flex: 0 130px;
    width: 130px;
    padding-right: 15px;;
    text-align: right;
    font-size: 17px;
    color: #6a88b5;
}
.feut-manager-message-content{
    flex: 1;
    text-align: left;
    color: #268dc7;
}
</style>