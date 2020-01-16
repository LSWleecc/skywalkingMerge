<template>
  <div class="rk-trace-t flex-v">
    <div class="rk-trace-t-tool flex-h">
      <RkPage :currentSize="15" :currentPage="callerStore.traceForm.paging.pageNum" @changePage="page" :total="callerStore.traceTotal"/>
      <span class="rk-tag mr-10 sm">调用方</span>
    </div>
    <div class="rk-trace-t-loading" v-show="loading">
      <svg class="icon loading">
        <use xlink:href="#spinner"></use>
      </svg>
    </div>
    <div v-show="callerStore.invokTraceList.length === 0 && !loading" style="text-align: center; margin: 10px">暂无数据</div>
    <div class="rk-trace-t-wrapper scroll_hide" v-show="!loading">
      <table class="rk-trace-t">
        <tr class="rk-trace-tr cp" v-for="(i, index) in callerStore.invokTraceList" @click="selectCurrentTrace(i)" :key="index">
          <td class="rk-trace-td" :class="{
                'rk-trace-success':!i.isError,
                'rk-trace-error':i.isError,
                'selected': selectedKey == i.id
                }">
            <div class="ell mb-5" :class="{
                'blue':!i.isError,
                'red':i.isError,
                }" style="display: flex; justify-content: space-between"><span class="b">{{i.name}}</span><span class="rk-tag ms">{{i.value}}</span></div>
            <!--<div class="grey ell sm"><span class="rk-tag mr-10 sm">调用总次数：{{i.value}}</span></div>-->
          </td>
        </tr>
      </table>
    </div>
  </div>
</template>

<script lang="ts">
    import { Component, Vue, Prop, Watch } from 'vue-property-decorator';
    import { Action, Getter, Mutation, State } from 'vuex-class';
    @Component
    export default class CallerTable extends Vue {
        @State('callerStore') private callerStore!: any;
        @Mutation('callerStore/SET_TRACE_FORM_ITEM') private SET_TRACE_FORM_ITEM: any;
        @Mutation('callerStore/SET_CURRENT_TRACE') private SET_CURRENT_TRACE: any;
        @Mutation('callerStore/SET_DEFAULT_EMPTY_TRACE') private SET_DEFAULT_EMPTY_TRACE: any;
        @Action('callerStore/GET_INVOKLIST') private GET_INVOKLIST: any;
        @Action('callerStore/GET_QUERY') private GET_QUERY: any;
        @Getter('durationTime') private durationTime: any;
        private loading: boolean = false;
        private selectedKey: string = '';

        @Watch('callerStore.invokTraceList')
        private onTraceListChange() {
            if (this.callerStore.invokTraceList && this.callerStore.invokTraceList.length > 0) {
                this.selectTrace(this.callerStore.invokTraceList[0]);
            }
            if (this.callerStore.invokTraceList && this.callerStore.invokTraceList.length === 0) {
                this.SET_DEFAULT_EMPTY_TRACE();
            }
        }
        private handleRefresh() {
            return  this.GET_QUERY({
                serviceId: this.callerStore.currentTrace.id,
                endpointId: this.callerStore.currentEndpoint.key,
                duration: this.durationTime,
            });
        }
        private selectTrace(i: any) {
            this.SET_CURRENT_TRACE(i);
            this.selectedKey = i.id;
        }
        private selectCurrentTrace(i: any) {
            this.SET_CURRENT_TRACE(i);
            this.selectedKey = i.id;
            this.$eventBus.$emit('SET_CALLER_LOADING_HIDDEN', () => {
                this.handleRefresh().then(() => {
                    this.$eventBus.$emit('SET_CALLER_LOADING_SHOW')
                })
            });
        }
        private page(p: number) {
            this.loading = true;
            this.SET_TRACE_FORM_ITEM({type: 'paging', data: { pageNum: p, pageSize: 15, needTotal: true}});
            this.GET_INVOKLIST({
                endpointId: this.callerStore.currentEndpoint.key,
                duration: this.durationTime,
                paging: {pageNum: p, pageSize: 15, needTotal: true},
                order: 'DES'
            }).then(() => {
                this.loading = false;
                this.handleRefresh();
            });
        }

        private created() {
            this.$eventBus.$on('SET_CALLER_LOADING_TRUE', this, (cb: any) => {
                this.loading = true;
                if (cb) {
                    cb();
                }
            });
            this.$eventBus.$on('SET_CALLER_LOADING_FALSE', this, (data: any) => {
                this.loading = false;
            });
        }
    }
</script>
<style lang="scss">
  .rk-trace-t{
    flex-grow: 1;
    height: 100%;
    position: relative;
  }
  .rk-trace-t-tool{
    flex-shrink: 0;
    background-color: rgba(196, 200, 225, 0.2);
    justify-content: space-between;
    padding-right: 5px;
    select{
      background-color: rgba(0, 0, 0, 0);
      outline: 0;
      border-style: unset;
    }
    padding-top: 1px;
    border-bottom: 1px solid #c1c5ca41;
    border-right: 1px solid #c1c5ca41;
    height: 35px;
  }
  .rk-trace-t-wrapper{
    overflow: auto;
    flex-grow: 1;
    border-right: 1px solid rgba(0,0,0,0.1);
  }
  .rk-trace-t-loading{
    text-align: center;
    position: absolute;
    width: 100%;
    height: 70px;
    margin-top: 40px;
    line-height: 88px;
    overflow: hidden;
    .icon{
      width: 30px;
      height: 30px;
    }
  }
  .rk-trace-t {
    width: 100%;
    border-spacing: 0;
    table-layout: fixed;
  }
  .rk-trace-tr{
    &:hover{
      background-color: rgba(0,0,0,.04)
    }
  }
  .rk-trace-td {
    padding: 8px 10px;
    border-bottom: 1px solid rgba(0,0,0,.07);
    &.selected {
      background-color:#ededed;
    }
  }
  .rk-trace-success{
    border-left: 4px solid rgba(46, 47, 51, 0.1);
  }
  .rk-trace-warning{
    border-left: 4px solid #FBB03B;
  }
  .rk-trace-error{
    border-left: 4px solid #E54C17;
  }
  .rk-tag{
    border-radius: 4px;
    padding-right: 5px;
    padding-left: 5px;
    background-color: #40454e;
    color: #eee;
  }
</style>
