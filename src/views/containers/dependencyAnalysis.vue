<template>
  <div class="flex-v" style="flex-grow:1;height: 100%;">
    <DependSearch/>
    <div class="rk-invok-inner">
      <DependTable/>
      <DependDetail :current="DependTrace.currentTrace"/>
    </div>
  </div>
</template>
<script lang="ts">
    import { Component, Vue } from 'vue-property-decorator';
    import { Action, Getter, State, Mutation } from 'vuex-class';
    import DependSearch from '@/views/components/dependency/dependency-search.vue';
    import DependTable from '@/views/components/dependency/dependency-table.vue';
    import DependDetail from '@/views/components/dependency/dependency-detail.vue';
    import Depend from '../../store/modules/dependency';

    @Component({
        components: {
            DependSearch,
            DependTable,
            DependDetail
        }
    })
    export default class dependencyMap extends Vue {
        @State('DependTrace') private DependTrace!: any;
        @Mutation('SET_EVENTS') private SET_EVENTS: any;
        @Action('SET_NEW_DURATION') private SET_NEW_DURATION: any;
        private beforeCreate() {
            this.$store.registerModule('DependTrace', Depend);
        }
        private beforeMount() {
            this.SET_EVENTS([]);
            this.SET_NEW_DURATION();
        }
        private beforeDestroy() {
            this.$store.unregisterModule('DependTrace');
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