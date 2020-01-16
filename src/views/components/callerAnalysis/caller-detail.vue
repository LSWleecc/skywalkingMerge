<template>
  <div class="rk-trace-detail flex-v">
    <div class="rk-trace-detail-wrapper clear"  v-if="current.name && isShow">
      <h5 class="mb-5 mt-0">
        <svg v-if="current.isError" class="icon red vm mr-5 sm">
          <use xlink:href="#clear"></use>
        </svg>
        <span class="vm">{{current.name}}</span>
      </h5>
    </div>

    <div class="rk-dashboard-item-body" v-if="current.name && isShow">
      <div class="dashboard-container clear">
        <CallerItem
          v-for="(i, index) in callerStore.invokChartList" v-if="callerStore.invokChartList.length" :key="index" :index="index"
          :rocketGlobal="rocketGlobal" :i="i" :dragIndex="dragIndex"
          @dragStart="dragStart">
        </CallerItem>
      </div>
      <!--<component :is="'ChartLine'" ref="chart" :i="chartList[0]" :intervalTime="intervalTime" :data="current.serviceCallData"></component>-->
    </div>
    <div v-if="!current.name || !isShow" class="flex-h container">
      <svg class="icon rk-icon-trace">
        <use xlink:href="#unlink"></use>
      </svg>
    </div>
  </div>
</template>

<script lang="ts">
    import { Vue, Component, Prop } from 'vue-property-decorator';
    import { Trace, Span } from '@/types/trace';
    import { Action, State ,Getter} from 'vuex-class';
    import charts from '../dashboard/charts';
    import CallerItem from './caller-item.vue';
    import copy from '@/utils/copy';

    @Component({ components: {
        ...charts,
        CallerItem
    }})
    export default class CallerDetail extends Vue {
        @State('rocketbot') private rocketGlobal: any;
        @Getter('intervalTime') public intervalTime: any;
//        @Action('GET_QUERY') private GET_QUERY: any;
//        @State('rocketOption') private stateDashboardOption!: any;
        @State('callerStore') private callerStore: any;
        @Getter('durationTime') private durationTime: any;
//        @Action('MIXHANDLE_GET_OPTION') private MIXHANDLE_GET_OPTION: any;
        @Prop() private current!: any;
        private dragIndex: number = NaN;
        private isShow: boolean = false;

        public dragStart(index: number) {
            this.dragIndex = index;
        }
        private created() {
            this.$eventBus.$on('SET_CALLER_LOADING_SHOW', this, (cb: any) => {
                this.isShow = true;
                if (cb) {
                    cb();
                }
            });
            this.$eventBus.$on('SET_CALLER_LOADING_HIDDEN', this, (cb: any) => {
                this.isShow = false;
                if (cb) {
                    cb();
                }
            });
        }

    }
</script>

<style lang="scss" scoped>
  .rk-trace-detail {
    flex-shrink: 0;
    height: 100%;
    width: 75%;
    overflow-y:auto;
  }
  .rk-trace-detail-wrapper {
    padding: 8px 30px;
    border-bottom: 1px solid rgba(0,0,0,0.1);
  }
  .rk-trace-detail-ids{
    background-color: rgba(0, 0, 0, 0);
    outline: 0;
    border-style: unset;
    color: inherit;
    border: 1px solid;
    border-radius: 4px;
  }
  .rk-tag{
    display: inline-block;
    border-radius: 4px;
    padding: 0px 7px;
    background-color: #40454e;
    color: #eee;
  }
  .rk-icon-trace{
    width:100px;
    height:100px;
    margin: 0 auto;
    fill: rgba(46, 47, 51, 0.15);
  }
  .rk-trace-table_svg-icon {
    width: 11px;
    height: 11px;
  }
  .rk-dashboard-item-body{
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .dashboard-container{
    overflow: auto;
    padding:20px 15px;
    height: 100%;
    flex-grow: 1;
  }
</style>
