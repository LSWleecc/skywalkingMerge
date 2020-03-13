<template>
  <div class="rk-container flex-v">
    <div class="rk-inner">
      <div class="rk-tree-content flex-v">
        <div class="rk-tree scroll_hide">
          <div class="rk-title">策略管理</div>
          <el-tree
            style="background-color: #F0F2F5"
            ref="treeData"
            :data="rocketAlarm.rootData"
            :load="loadNode"
            @node-click="getCurrentNode"
            :props="defaultProps"
            node-key="key"
            :highlight-current="true"
            lazy>
          </el-tree>
        </div>
      </div>

      <div class="rk-strategy-detail flex-v">
        <div v-if="currentName">
          <div  class="rk-title">普通策略</div>
          <div class="flex-h rk-add">
            <div class="flex-h">当前名称:{{currentName}}</div>
            <el-button type="primary" size="mini" @click="addMetricAlarmRule">添加策略</el-button>
          </div>
          <div class="flex-h noStrategy" v-if="rocketAlarm.Strategylist.length == 0">还未添加策略</div>
          <div class="stragegys" v-else>
            <div class="strategys-content" v-for="(item) in rocketAlarm.Strategylist" :key="item.key">
              <div class="staraegy-name">
                <span>{{item.label}}</span>
                <div>{{item.message}}</div>
              </div>
              <div>
                <el-switch
                  class="switch-btn"
                  v-model="item.disabled"
                  @change="handleChange($event, item)"
                  active-text="启用"
                  inactive-text="禁用">
                </el-switch>
                <el-button @click="EditStrategy(item)" class="rk-edit" type="primary" icon="el-icon-edit" circle size="mini"></el-button>
                <el-button type="danger" icon="el-icon-delete" circle size="mini"></el-button>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="rk-no-strategy">暂无策略</div>
        <div class="strategy-table scroll_hide" v-if="this.currentLevel == 1">
          <div class="rk-bottom">
            <div>
              <div  class="rk-manage">
                <span>业务告警</span>
                <el-button type="primary" size="mini"  @click="addAlarm">添加告警</el-button>
              </div>
              <div>
                <el-form v-if="ruleForm.tableData.length" :model="ruleForm" :rules="rules" ref="ruleForm">
                  <el-table :data="ruleForm.tableData" border size="small">
                    <el-table-column label="自定义key" width="100%">
                      <template slot-scope="scope">
                        <el-form-item v-show="scope.row.disabled"  :prop="'tableData.' + scope.$index + '.eventKey'" :rules='rules.key'>
                          <el-input size="small" placeholder="请输入内容" v-model="scope.row.eventKey"></el-input>
                        </el-form-item>
                        <span v-show="!scope.row.disabled">{{scope.row.eventKey}}</span>
                      </template>
                    </el-table-column>
                    <el-table-column label="延迟期（min)" width="100%">
                      <template slot-scope="scope">
                        <el-form-item v-show="scope.row.disabled"  :prop="'tableData.' + scope.$index + '.silencePeriod'" :rules='rules.delayTime'>
                          <el-input size="small" placeholder="请输入内容" v-show="scope.row.disabled" v-model="scope.row.silencePeriod"></el-input>
                        </el-form-item>
                        <span  v-show="!scope.row.disabled">{{scope.row.silencePeriod}}</span>
                      </template>
                    </el-table-column>
                    <el-table-column label="报警消息">
                      <template slot-scope="scope">
                        <el-form-item v-show="scope.row.disabled"  :prop="'tableData.' + scope.$index + '.id'" :rules='rules.alarmMessage'>
                          <el-input size="small" placeholder="请输入内容" v-show="scope.row.disabled" v-model="scope.row.id"></el-input>
                        </el-form-item>
                        <span v-show="!scope.row.disabled">{{scope.row.id}}</span>
                      </template>
                    </el-table-column>
                    <el-table-column label="操作" width="300px">
                      <template slot-scope="scope">
                        <el-button size="small" :type="scope.row.disabled ? 'primary' : 'warning'" :disabled="scope.row.notifySMS" @click="edit(scope.row, scope.$index)">{{scope.row.disabled ? '保存':'修改'}}</el-button>
                        <el-button size="small" type="danger" :disabled="scope.row.notifySMS" @click="delete(scope.row, scope.$index)">删除</el-button>
                        <el-switch style="margin-left: 20px"
                                   active-text="启用"
                                   inactive-text="禁用">
                        </el-switch>
                      </template>
                    </el-table-column>
                  </el-table>
                </el-form>
                <div v-else class="flex-h" style="justify-content:center">暂无自定义告警</div>
                <!--<div>-->
                  <!--<el-pagination-->
                    <!--layout="total, prev, pager, next"-->
                    <!--:total="100"-->
                  <!--&gt;</el-pagination>-->
                <!--</div>-->
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
  import Vue from 'vue'
  import { Component, Prop, Watch } from 'vue-property-decorator';
  import {Action, Getter, State, Mutation} from "vuex-class";
  import compareObj from '@/utils/comparison';
  import service from '@/utils/config-service';
  import Axios, {AxiosResponse} from "axios";
  import {DurationTime} from "@/types/global";

  @Component({
    components: {}
  })
  export default class StrategyList extends Vue {
    @State('rocketAlarm') private rocketAlarm!: any;
    @Getter('durationTime') public durationTime: any;
    @Action('rocketAlarm/SEARCH_METRIC_LIST') private SEARCH_METRIC_LIST: any;
    @Action('rocketAlarm/SEARCH_EVENT_LIST') private SEARCH_EVENT_LIST: any;
    @Action('rocketAlarm/GET_ROOT_DATA') private GET_ROOT_DATA: any;
    @Action('rocketAlarm/ADD_METRIC_ALARM_RULE') private ADD_METRIC_ALARM_RULE: any;
    public currentName = '';
    public currentLevel = ''; //标志当前点击的是服务还是端点
    public currentNode = {};
    public defaultProps =  {
      name: 'label',
      id: 'key',
    }
    public rules = {
      key:[{ required: true, message: '不能为空', trigger: 'blur'}],
      delayTime: [{required: true, message: '不能为空', trigger: 'blur'}],
      alarmMessage: [{required: true, message: '不能为空', trigger: 'blur'}]
    }
    public ruleForm = {
      tableData: []
    };
    public addMetricAlarmRule() {
      this.$eventBus.$emit('SHOW_STRATEGY_FORM');
      this.$eventBus.$emit('ADD_METRIC', this.currentNode);
    }
    public delete(ruleForm:any,row:any, index:any) {
      console.log(ruleForm,row,index)

    }
    public getCurrentNode(data, node, obj) {
//      this.$refs['treeData'].setCurrentKey(node.data.key);
      this.currentLevel = node.level;
      this.currentName = node.data.label;
      this.currentNode = node;
    }
    public handleChange($event:any, item: any) {
      console.log($event,'ff',item)
    }
    public edit(row, index) {
        (this.$refs.ruleForm as any).validate((valid:boolean) => {
        this.ruleForm.tableData.forEach((item,index) => {
          item.notifySMS = true;
        });
        row.notifySMS = false;
        if (valid) {
          row.disabled = row.disabled ? false:true;
          if(!row.disabled){
            this.ruleForm.tableData.forEach((item:any,index:any) => {
              item.notifySMS = false;
            })
          }
        } else {
          return false;
        }
      });
    }
    public addAlarm(){

    }
    public EditStrategy(item) {
        this.$eventBus.$emit('SHOW_STRATEGY_FORM', true);
        this.$eventBus.$emit('EDIT_STRATEGY_FORM', item);
    }
    public loadNode(node, resolve) {
        console.log('qq',node.level)
      if(node.level === 1){
          this.SEARCH_METRIC_LIST({
            scope: 'Service',
            serviceId: node.data.key,
            paging: {
              pageNum: 1,
              pageSize: 20,
              needTotal: true,
            }});
        /*this.SEARCH_EVENT_LIST({
            serviceId: node.data.key,
            paging: {
                pageNum: 1,
                pageSize: 10,
                needTotal: true
            }
        });*/
        const queryEventAlarmData = {
            query: `query queryEventAlarmRules( $serviceId: ID!, $paging:Pagination!) {
              searchEventAlarmRules( serviceId: $serviceId, paging: $paging) {
                items: rules{
                  id
                  eventKey
                  serviceId
                  silencePeriod
                  disabled
                  notifySMS
                  notifyDisabled
                }
                total
              }
            }`,
            variables: {
                serviceId: node.data.key,
                paging: {
                    pageNum: 1,
                    pageSize: 10,
                    needTotal: true
                }
            }
        };
        service({
            method: 'post',
            url: '/graphql',
            data: queryEventAlarmData
        }).then((res) => {
            this.ruleForm.tableData = res.data.data.searchEventAlarmRules.items
        });
        const queryData = {
            query: `query queryEndpoints($serviceId: ID!, $keyword: String!) {
                getEndpoints: searchEndpoint(serviceId: $serviceId, keyword: $keyword, limit: 100) {
                key: id
                label: name
              }
            }`,
            variables: {
                serviceId: node.data.key,
                keyword: ''
            },
        };
        service({
            method: 'post',
            url: '/graphql',
            data: queryData
        }).then((res) => {
            resolve(res.data.data.getEndpoints)
        }).catch(() => {
            resolve([])
        })
      }else if(node.level === 2) {
        resolve([])
      }
    }

    @Watch('durationTime')
    private watchDurationTime(newValue: DurationTime, oldValue: DurationTime) {
      // Avoid repeating fetchData() after enter the component for the first time.
      if (compareObj(newValue, oldValue)) {
        console.log(newValue, oldValue)
        this.GET_ROOT_DATA({duration: newValue})
      }
    }
    public created() {
      this.GET_ROOT_DATA({duration: this.durationTime})
    }
  }
</script>

<style lang="scss" scoped>
  .noStrategy {
    justify-content: center;
    align-items: center;
    width: 100%;
    padding: 20px;
  }
  .stragegys {
    padding: 0 20px;
  }
  .del-btn {
    display: none;
    margin-left: 20px;
  }
  .strategys-content {
    display: flex;
    cursor: pointer;
    &:hover {
      .del-btn {
        display: block;
      }
    }
  }
  .staraegy-name {
    width: 75%;
    margin: 10px 0px;
  }
  .switch-btn {
    height: 100%;
    line-height: 100%;
  }
  .rk-title {
    padding: 10px 10px;
    font-size: 16px;
    font-weight: bold;
  }
  .rk-content {
    padding: 10px 0px;
    font-size: 16px;
    font-weight: bold;
    display: flex;
    justify-content: space-between;
  }
  .rk-container {
    height:100%;
    width:100%;
    display: flex;
    min-height: 0;
  }
  .rk-inner {
    height:100%;
    display: flex;
    min-height:0;
  }
  .rk-tree-content {
    width: 100%;
    border-spacing:0;
    table-layout: fixed;
  }
  .rk-tree{
    overflow: auto;
    flex-grow: 1;
    border-right: 1px solid rgba(0, 0, 0, 0.1)
  }
  .rk-strategy-detail {
    flex-shrink: 0;
    height: 100%;
    width: 75%;
    overflow: auto;
  }
  .rk-no-strategy {
    display: flex;
    height:100%;
    justify-content:center;
    align-items: center;
  }
  .strategy-table {
    overflow: auto;
    padding: 0px 20px;
    position: relative;
    min-height: 350px;
    border-top: 1px solid rgba(0, 0, 0, 0.1);
  }
  .rk-add {
    padding: 0px 20px;
    justify-content: space-between;
  }
  .rk-edit {
    margin: 0px 10px;
  }
  .rk-manage {
    display: flex;
    justify-content: space-between;
    padding: 10px 0px;
    font-size: 16px;
    font-weight: bold;
  }
  .rk-init {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
  }
</style>
