<template>
  <div class="rk-trace-search">
    <div>
      <a class="rk-trace-search-btn bg-blue r mr-10" @click="handleOption">
        <svg class="icon mr-5 vm">
          <use xlink:href="#search"></use>
        </svg>
        <span class="vm">{{this.$t('search')}}</span>
      </a>
      <div class="flex-h">
        <callerSelect :hasSearch="true" :title="this.$t('service')" :value="callerStore.currentService" @input="selectService"
                     :data="callerStore.services"/>
        <callerSelect :hasSearch="true" :title="this.$t('endpoint')"  :value="callerStore.currentEndpoint" @input="selectEndpoint" :data="callerStore.endpoints"/>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
    import { Duration, Option, DurationTime } from '@/types/global';
    import { Component, Vue, Watch } from 'vue-property-decorator';
    import { Action, Getter, Mutation, State } from 'vuex-class';
    import compareObj from '@/utils/comparison';
    import callerSelect from './caller-select.vue';

    @Component({components: {callerSelect}})
    export default class callerSearch extends Vue {
        @State('callerStore') private callerStore!: any;
        @Getter('durationTime') private durationTime: any;
        @Mutation('SET_EVENTS') private SET_EVENTS: any;
        @Action('callerStore/GET_QUERY') private GET_QUERY: any;
        @Action('callerStore/GET_INVOKLIST') private GET_INVOKLIST: any;
        @Action('callerStore/SELECT_SERVICE') private SELECT_SERVICE: any;
        @Action('callerStore/SELECT_ENDPOINT') private SELECT_ENDPOINT: any;
        @Mutation('callerStore/SET_DEFAULT_EMPTY_TRACE') private SET_DEFAULT_EMPTY_TRACE: any;
        @Mutation('callerStore/SET_CURRENT_TRACE') private SET_CURRENT_TRACE: any;
        @Mutation('callerStore/SET_CALLER_LIST') private SET_CALLER_LIST: any;
        @Action('callerStore/MIXHANDLE_GET_OPTION') private MIXHANDLE_GET_OPTION: any;
        private handleRefresh() {
            return  this.GET_QUERY({
                serviceId: this.callerStore.currentTrace.id,
                endpointId: this.callerStore.currentEndpoint.key,
                duration: this.durationTime,
            });
        }
        private selectService(i: any) {
            if (this.callerStore.currentService.key === i.key) {
                return;
            }
            this.SELECT_SERVICE({service: i, duration: this.durationTime});
        }

        private selectEndpoint(i: any) {
            if (this.callerStore.currentEndpoint.key === i.key) {
                return;
            }
            this.SELECT_ENDPOINT({endpoint: i, duration: this.durationTime});
        }
        private handleSearch() {
//            this.SET_DEFAULT_EMPTY_TRACE();
//            this.SET_CALLER_LIST([]);

            this.$eventBus.$emit('SET_CALLER_LOADING_HIDDEN');

            this.$eventBus.$emit('SET_CALLER_LOADING_TRUE', () => {
                this.GET_INVOKLIST({
                    endpointId: this.callerStore.currentEndpoint.key,
                    duration: this.durationTime,
                    paging: {pageNum: 1, pageSize: 15, needTotal: true},
                    order: 'DES'
                }).then(() => {
                    this.$eventBus.$emit('SET_CALLER_LOADING_FALSE');
                    if(this.callerStore.currentTrace.id){
                        this.handleRefresh().then(() => {
                            this.$eventBus.$emit('SET_CALLER_LOADING_SHOW');
                        })
                    }
                }).catch(() => {
                    this.$eventBus.$emit('SET_CALLER_LOADING_FALSE');
                })
            })
        }
        private handleOption() {
            this.SET_DEFAULT_EMPTY_TRACE();
            this.$eventBus.$emit('SET_CALLER_LOADING_TRUE', () => {
                this.MIXHANDLE_GET_OPTION({duration: this.durationTime})
                    .then(() => {
                        this.$eventBus.$emit('SET_CALLER_LOADING_FALSE');
                        if(this.callerStore.currentEndpoint.key) {
                            this.handleSearch();
                        }
                    }).catch(() => {
                    this.$eventBus.$emit('SET_CALLER_LOADING_FALSE');
                })
            });
        }

        @Watch('durationTime')
        private watchDurationTime(newValue: DurationTime, oldValue: DurationTime) {
            // Avoid repeating fetchData() after enter the component for the first time.
            if (compareObj(newValue, oldValue)) {
//                this.handleSearch();
            }
        }

        private mounted() {
            this.handleOption();
            this.SET_EVENTS([this.handleOption]);
        }
    }
</script>

<style lang="scss">
  .rk-trace-search {
    flex-shrink: 0;
    background-color: #333840;
    color: #eee;
    width: 100%;
    padding: 3px 15px 8px;
  }

  .rk-trace-search-input {
    border-style: unset;
    outline: 0;
    padding: 2px 5px;
    border-radius: 3px;
  }

  .rk-trace-search-range,.rk-auto-select {
    border-radius: 3px;
    background-color: #fff;
    padding: 1px;
    border-radius: 3px;

    input {
      width: 38px;
      border-style: unset;
      outline: 0;
    }
  }

  .rk-trace-search-btn {
    padding: 3px 9px;
    background-color: #484b55;
    border-radius: 4px;
    margin-top: 12px;

    &.bg-blue {
      background-color: #448dfe;
    }
  }

  .rk-trace-clear-btn {
    padding: 3px 9px;
    background-color: #484b55;
    border-radius: 4px;
    margin-top: 12px;

    &.bg-warning {
      background-color: #FBB03B;
    }
  }

  .rk-trace-search-more {
    background-color: #484b55;
    padding: 4px 10px;
    border-radius: 3px;
    margin-top: 8px;
    position: relative;
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, .1);

    &:after {
      bottom: 100%;
      right: 30px;
      border: solid transparent;
      content: " ";
      height: 0;
      width: 0;
      position: absolute;
      pointer-events: none;
      border-color: rgba(0, 0, 0, 0);
      border-bottom-color: #484b55;
      border-width: 8px;
      margin-right: 0px;
    }
  }
</style>
