<template>
  <div class="flex-v" style="flex-grow:1;height: 100%;">
    <callerSearch/>
    <div class="rk-invok-inner">
      <callerTable/>
      <callerDetail :current="callerStore.currentTrace"/>
    </div>
  </div>
</template>
<script lang="ts">
    import { Component, Vue, Watch} from 'vue-property-decorator';
    import { Action, Getter, State, Mutation } from 'vuex-class';
    import { Duration, Option } from '@/types/global';
    import callerSearch from '@/views/components/callerAnalysis/caller-search.vue'
    import callerTable from '@/views/components/callerAnalysis/caller-table.vue';
    import callerDetail from '@/views/components/callerAnalysis/caller-detail.vue';
    import callerStore from '../../store/modules/callerAnalysis';

    @Component({
        components: {
            callerSearch,
            callerTable,
            callerDetail
        }
    })
    export default class callerAnalysis extends Vue {
        @State('callerStore') private callerStore!: any;
        @Mutation('SET_EVENTS') private SET_EVENTS: any;
        private beforeCreate() {
            this.$store.registerModule('callerStore', callerStore);
        }
        private beforeMount() {
//            this.SET_EVENTS([]);
        }
        private beforeDestroy() {
            this.$store.unregisterModule('callerStore');
        }
    }
</script>
<style lang="scss" scoped>
  .rk-invok-inner{
    height: 100%;
    display: flex;
    min-height: 0;
  }
</style>