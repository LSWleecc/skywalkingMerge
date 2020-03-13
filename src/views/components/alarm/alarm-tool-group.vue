
<template>
  <nav class="rk-dashboard-group">
    <span v-for="(i, index) in rocketComps.tree" :key="index" class="mr-15">
      <a class="rk-dashboard-group-i mb-10" @click="handleOption(index)" :class="{'active': rocketComps.group == index, 'grey': rocketComps.group != index}">{{i.name}}</a>
    </span>
  </nav>
</template>

<script lang="ts">
  import Vue from 'vue';
  import { Component, Prop } from 'vue-property-decorator';
  import { Mutation, Action, Getter } from 'vuex-class';

  @Component({})
  export default class AlarmToolGroup extends Vue {
    @Prop() private rocketComps: any;
    @Mutation('rocketAlarm/MIXHANDLE_CHANGE_GROUP') private MIXHANDLE_CHANGE_GROUP: any;
    private handleOption(index: any) {
      this.MIXHANDLE_CHANGE_GROUP(index);
    }
  }
</script>

<style lang="scss" scoped>
  .rk-dashboard-group{
    border-bottom:1px solid #252a2f;
    background-color: #333840;
    padding: 10px 15px 0;
    color: #eee;
  }
  .rk-dashboard-group-sel{
    outline: none;
    border: 0;
  }
  .rk-dashboard-group-i{
    display: inline-block;
    padding: 4px 13px 4px 15px;
    border-radius: 4px;
    position: relative;
    background-color: rgba(255, 255, 255, 0.07);
    box-shadow: 0 1px 1px rgba(0, 0, 0, 0.08);
    will-change: border-color,color;
    transition: border-color .3s, color .3s;
    &.active::before{
      content: '';
      position: absolute;
      display: inline-block;
      width: 5px;
      height: 10px;
      border-radius: 4px;
      background-color: #448dfe;
      top: 9px;
      left: 4px;
    }
  }
</style>
