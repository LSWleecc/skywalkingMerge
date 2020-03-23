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
      <div v-if="showAlarm" class="rk-strategy-detail flex-v">
        <div>
          <div class="rk-title">普通策略</div>
          <div v-if="currentNode.data" class="flex-h rk-add">
            <div class="flex-h rk-title">当前服务/端点:{{currentNode.data.label}}</div>
            <!--<el-button type="primary" size="mini" @click="switchAlarms">批量操作</el-button>-->
            <div>
              <el-button type="primary" size="mini" @click="addMetricAlarmRule">添加策略</el-button>
              <el-button  type="primary" v-if="currentNode.level== 1" plain @click="switchAllAlarmRules(false)" size="mini">启用所有</el-button>
              <el-button  type="warning" v-if="currentNode.level== 1" plain @click="switchAllAlarmRules(true)" size="mini">禁用所有</el-button>
            </div>
          </div>
          <el-table
            :show-header="false"
            :data="rocketAlarm.Strategylist"
            @selection-change="selectAlarmRules"
          >
            <!--<el-table-column type="selection"></el-table-column>-->
            <el-table-column label="策略名称">
              <template slot-scope="scope">
                <span>{{scope.row.metricsName}}</span>
              </template>
            </el-table-column>
            <el-table-column label="消息">
              <template slot-scope="scope">
                <span>{{`当${scope.row.metricsName}${scope.row.op == '>' ? '大于' : scope.row.op == '<' ? '小于' : '等于' }阈值${scope.row.threshold}${scope.row.metricsName == 'service_sla' ? '%' : '毫秒'}时，将在${scope.row.silencePeriod}分钟后每${scope.row.period}分钟报警${scope.row.count}次`}}</span>
              </template>
            </el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-switch
                  class="switch-btn"
                  v-model="scope.row.disabled"
                  @change="handleChangeMetricAlarm(scope.row)"
                  active-text="启用"
                  inactive-text="禁用"
                  :active-value="false"
                  :inactive-value="true"
                >
                </el-switch>
                <el-button @click="EditStrategy(scope.row)" class="rk-edit" type="primary" icon="el-icon-edit" circle size="mini"></el-button>
                <el-button @click="deleteAlarmRule(scope.row)" type="danger" icon="el-icon-delete" circle size="mini"></el-button>
              </template>
            </el-table-column>

          </el-table>
          <!--<div class="rk-loading" v-show="loading">
            <svg class="icon loading">
              <use xlink:href="#spinner"></use>
            </svg>
          </div>-->
        </div>
        <div class="strategy-table scroll_hide" v-if="currentNode.level == 1">
          <div class="rk-bottom">
            <div>
              <div  class="rk-manage">
                <span>业务告警</span>
                <div>
                  <el-button type="primary" size="mini"  @click="addEventAlarmRule">添加告警</el-button>
                  <el-button  type="primary" plain size="mini" @click="switchAllEventRules(false)">启用所有</el-button>
                  <el-button  type="warning" plain size="mini" @click="switchAllEventRules(true)">禁用所有</el-button>
                </div>
              </div>
              <div>
                <el-form  :model="ruleForm" :rules="rules" ref="ruleForm">
                  <el-table :data="ruleForm.tableData" border size="small">
                    <!--<el-table-column type="selection"></el-table-column>-->
                    <el-table-column label="自定义key">
                      <template slot-scope="scope">
                        <el-form-item v-show="!scope.row.notifyDisabled"  :prop="'tableData.' + scope.$index + '.eventKey'" :rules='rules.key'>
                          <el-input :disabled="true" size="small" v-model="scope.row.eventKey"></el-input>
                        </el-form-item>
                        <span v-show="scope.row.notifyDisabled">{{scope.row.eventKey}}</span>
                      </template>
                    </el-table-column>
                    <el-table-column label="延迟期（min)">
                      <template slot-scope="scope">
                        <el-form-item v-show="!scope.row.notifyDisabled"  :prop="'tableData.' + scope.$index + '.silencePeriod'" :rules='rules.delayTime'>
                          <!--<el-input size="small" placeholder="请输入内容" v-model="scope.row.silencePeriod"></el-input>-->
                          <el-input-number :min="1" size="small" placeholder="请输入内容" v-model="scope.row.silencePeriod"></el-input-number>
                        </el-form-item>
                        <span  v-show="scope.row.notifyDisabled">{{scope.row.silencePeriod}}</span>
                      </template>
                    </el-table-column>
                    <el-table-column label="操作" width="300px">
                      <template slot-scope="scope">
                        <el-button size="small" :type="scope.row.notifyDisabled ? 'warning' : 'primary'" :disabled="scope.row.notifySMS" @click="editEventAlarmRule(scope.row, scope.$index)">{{scope.row.notifyDisabled ? '修改':'保存'}}</el-button>
                        <el-button size="small" type="danger" :disabled="scope.row.notifySMS" @click="deleteEventAlarmRule(scope.row, scope.$index)">删除</el-button>
                        <el-switch style="margin-left: 20px"
                                   active-text="启用"
                                   inactive-text="禁用"
                                   :active-value="false"
                                   :inactive-value="true"
                                   v-model="scope.row.disabled"
                                   @change="handleChangeEventAlarm(scope.row)">
                        </el-switch>
                      </template>
                    </el-table-column>
                  </el-table>
                </el-form>

                <div v-if="total">
                  <el-pagination
                    style="display: flex; justify-content: center; margin-top: 10px"
                    background
                    layout="prev, pager, next, total"
                    :total="total"
                    :page-size="5"
                    :current-page.sync="currentPage"
                    @current-change="handleCurrentChange"
                  ></el-pagination>
                </div>
              </div>
              <div>
                <el-dialog title="添加自定义告警" :visible.sync="dialogFormVisible">
                  <el-form :model="eventAlarmData" ref="eventAlarmForm" :rules="rules" label-width="100px">
                    <el-form-item label="自定义key" prop="key">
                      <el-input placeHolder="请输入自定义key" v-model="eventAlarmData.key">
                        <template slot="prepend">businessAlarm:</template>
                      </el-input>
                    </el-form-item>
                    <el-form-item label="延期值(min)" prop="delayTime">
                      <el-input-number :min="1" v-model="eventAlarmData.delayTime"></el-input-number>
                    </el-form-item>
                    <el-form-item>
                      <el-button type="primary" @click="submitForm('eventAlarmForm')">确定</el-button>
                      <el-button @click="dialogFormVisible = false">取消</el-button>
                    </el-form-item>
                  </el-form>
                </el-dialog>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="rk-no-strategy rk-strategy-detail">暂无策略</div>
    </div>
  </div>
</template>

<script lang="ts">
  import Vue from 'vue'
  import { Prop, Watch } from 'vue-property-decorator';
  import Component from 'vue-class-component';
  import {Action, Getter, State, Mutation} from "vuex-class";
  import compareObj from '@/utils/comparison';
  import service from '@/utils/config-service';
  import Axios, {AxiosResponse} from "axios";
  import {DurationTime} from "@/types/global";
  import { errEvent, successEvent } from  '../../../utils/util';
  @Component({
    components: {}
  })
  export default class StrategyList extends Vue {
    @State('rocketAlarm') private rocketAlarm!: any;
    @Getter('durationTime') public durationTime: any;
    @Action('rocketAlarm/SEARCH_METRIC_LIST') private SEARCH_METRIC_LIST!: any;
    @Action('rocketAlarm/GET_ROOT_DATA') private GET_ROOT_DATA: any;
    @Action('rocketAlarm/ADD_METRIC_ALARM_RULE') private ADD_METRIC_ALARM_RULE: any;
    @Action('rocketAlarm/DEL_METRIC_ALARM_RULE') private DEL_METRIC_ALARM_RULE: any;
    @Action('rocketAlarm/SWITCH_METRIC_ALARM_RULE') private SWITCH_METRIC_ALARM_RULE: any;
    @Action('rocketAlarm/CREATE_EVENT_ALARM_RULE') private CREATE_EVENT_ALARM_RULE: any;
    @Action('rocketAlarm/DEL_EVENT_ALARM_RULE') private DEL_EVENT_ALARM_RULE!: any;
    @Action('rocketAlarm/SWITCH_EVENT_ALARM_RULE') private SWITCH_EVENT_ALARM_RULE: any;
    @Action('rocketAlarm/UPDATE_EVENT_ALARM_RULE') private UPDATE_EVENT_ALARM_RULE: any;
    @Action('rocketAlarm/SWITCH_DISABLE_METRICS') private SWITCH_DISABLE_METRICS: any;
    @Action('rocketAlarm/SWITCH_METRICS_ALARM_RULES_SERVICES') private SWITCH_METRICS_ALARM_RULES_SERVICES: any;
    @Action('rocketAlarm/SWITCH_EVENT_ALARM_RULES_SERVICES') private SWITCH_EVENT_ALARM_RULES_SERVICES: any;
    @Action('rocketAlarm/LOAD_CHILD_NODE') private LOAD_CHILD_NODE: any;
    public currentNode:any = Object.create(null);
    public dialogFormVisible = false;
    public showAlarm = false;
    public multipleAlarm = [];
    public defaultProps =  {
      name: 'label',
      id: 'key',
    };
    public currentPage = 1;
    public total = 0;
    public rules = {
      key:[{ required: true, pattern: /^[\w-:]{1,50}$/ ,message: '长度为50字符内不能包含特殊字符和中文', trigger: 'blur'}],
      delayTime: [{required: true, message: '不能为空', trigger: 'blur'}],
    }
    public ruleForm = {
      tableData: []
    };
    public eventAlarmData = {
        key: '',
        delayTime: '',
    }
    public addMetricAlarmRule() {
      this.$eventBus.$emit('SHOW_STRATEGY_FORM');
      this.$eventBus.$emit('ADD_METRIC', this.currentNode);
    }
    public selectAlarmRules(val: any) {
//        this.multipleAlarm = val.map((item) => item.id);
    }
    public switchAlarms() {
        this.SWITCH_DISABLE_METRICS({
            ids: this.multipleAlarm,
            disabled: true
        })
    }
    public switchAllAlarmRules(boolean: boolean) {
        this.$confirm(`此操作将${boolean ? '禁用' : '启用'}当前服务下（包括API）所有的所有策略，是否继续`,'提示',{
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
        }).then(() => {
            this.switchMetricsAlarmServices(boolean)
        }).catch(() => {
            this.$message({
                type: 'info',
                message: '已取消'
            })
        })
    }
    public switchMetricsAlarmServices(boolean: boolean) {
        this.SWITCH_METRICS_ALARM_RULES_SERVICES({
            serviceId: this.currentNode.data.key,
            disabled: boolean
        }).then(() =>  {
            this.$message({
                type: 'success',
                message: boolean ? '禁用成功':'启用成功'
            })
            this.SEARCH_METRIC_LIST({
                scope: 'Service',
                entityId: this.currentNode.data.key,
                paging: {
                    pageNum: 1,
                    pageSize: 10,
                    needTotal: true,
                }})
        })
            .catch((() => {
            this.$message({
                type: 'error',
                message: '启用失败'
            })
        }))
    }
    public switchAllEventRules(bool: boolean) {
        this.$confirm(`此操作将${bool ? '禁用' : '启用'}当前服务下（包括API）所有的所有业务告警，是否继续`,'提示',{
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
        }).then(() => {
            this.switchEventAlarmServices(bool)
        }).catch(() => {
            this.$message({
                type: 'info',
                message: '已取消'
            })
        })
    }
    public switchEventAlarmServices(bool:boolean) {
      this.SWITCH_EVENT_ALARM_RULES_SERVICES({
          serviceId: this.currentNode.data.key,
          disabled: bool
      }).then(() => {
          this.$message({
              type: 'success',
              message: bool ? '禁用成功':'启用成功'
          })
          this.currentPage = 1;
          this.getEventAlarmRules(this.currentNode, this.currentPage)
      }).catch(() => {
          this.$message({
              type: 'error',
              message: '启用失败'
          })
      })
    }
    public deleteEventAlarmRule(row: any) {
      this.DEL_EVENT_ALARM_RULE({id: row.id}).then(() => {
          successEvent('删除成功');
          this.currentPage = 1;
          this.getEventAlarmRules(this.currentNode, this.currentPage)
      })
    }
    public getCurrentNode(self: any, node: any) {
      this.showAlarm = true;
      this.currentNode = node;
        if(node.level === 1){
          this.currentPage = 1;
          this.SEARCH_METRIC_LIST({
            scope: 'Service',
            entityId: node.data.key,
            paging: {
              pageNum: 1,
              pageSize: 10,
              needTotal: true,
            }}),
          this.getEventAlarmRules(node, this.currentPage);
        }else if(node.level === 2) {
          this.SEARCH_METRIC_LIST({
            scope: 'Endpoint',
            entityId: node.data.key,
            paging: {
              pageNum: 1,
              pageSize: 5,
              needTotal: true,
            }});
        }
    }
    public getEventAlarmRules(node: any, pageIndex: number) {
        const queryEventAlarmData = {
            query: `query queryEventAlarmRules( $serviceId: ID!, $paging:Pagination!, $disabled: Boolean) {
              searchEventAlarmRules( serviceId: $serviceId, paging: $paging, disabled: $disabled) {
                items: rules{
                  id
                  eventKey
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
                    pageNum: pageIndex,
                    pageSize: 5,
                    needTotal: true
                }
            }
        };
        service({
            method: 'post',
            url: '/graphql',
            data: queryEventAlarmData
        }).then((res: any) => {
            if(res.status === 200 && res.data) {
                this.ruleForm.tableData = res.data.data.searchEventAlarmRules.items;
                this.total = res.data.data.searchEventAlarmRules.total;
            }
        });
    }
    public handleChangeMetricAlarm(item: any) {
      this.SWITCH_METRIC_ALARM_RULE({id: item.id, disabled: item.disabled}).then(() => {
          successEvent('操作成功');
      }).catch(() => {
          errEvent('操作失败');
//          item.disabled = !item.disabled;
      })
    }
    public handleChangeEventAlarm(node: any) {
      this.SWITCH_EVENT_ALARM_RULE({id: node.id, disabled: node.disabled}).then(() => {
          successEvent('操作成功');
      }).catch(() => {
          errEvent('操作失败');
//          node.disabled = !node.disabled;
      })
    }
    public editEventAlarmRule(row: any) {
        (this.$refs.ruleForm as any).validate((valid:boolean) => {
        this.ruleForm.tableData.forEach((item: any) => {
          item.notifySMS = true;
        });
        row.notifySMS = false;
        if (valid) {
          row.notifyDisabled = row.notifyDisabled ? false:true;
          if(row.notifyDisabled){
              this.UPDATE_EVENT_ALARM_RULE({id: row.id, silencePeriod: row.silencePeriod}).then(() => {
              successEvent('修改成功');
              this.currentPage = 1;
              this.getEventAlarmRules(this.currentNode, this.currentPage);
            }).catch(() => {
                 errEvent('修改失败')
              });
            this.ruleForm.tableData.forEach((item:any,index:any) => {
              item.notifySMS = false;
            })
          }
        } else {
          return false;
        }
      });
    }
    public handleCurrentChange(page: number) {
        this.getEventAlarmRules(this.currentNode, page)
    }
    public addEventAlarmRule(){
        this.dialogFormVisible = true;
    }
    public deleteAlarmRule(item: any) {
      this.DEL_METRIC_ALARM_RULE({id: item.id}).then(() => {
          successEvent('删除成功');
          this.SEARCH_METRIC_LIST({
              scope: 'Service',
              entityId: item.entityId,
              paging: {
                  pageNum: 1,
                  pageSize: 10,
                  needTotal: true,
              }});
      })
    };
    public EditStrategy(item: any) {
        this.$eventBus.$emit('SHOW_STRATEGY_FORM', true);
        this.$eventBus.$emit('EDIT_STRATEGY_FORM', {i: item, node:this.currentNode});
    }
    public loadNode(node: any, resolve: Function) {
      if(node.level === 1){
        this.LOAD_CHILD_NODE({serviceId: node.data.key, keyword: '', resolve: resolve});
      }else if(node.level === 2) {
        resolve([])
      }
    };
    public submitForm(eventAlarmForm: any) {
        (this.$refs.eventAlarmForm as any).validate((valid: boolean) => {
            if(valid) {
                const check = this.ruleForm.tableData.some((item: any):boolean => item.eventKey == this.eventAlarmData.key);
                if(check) {
                    errEvent('不能添加重复key');
                    return;
                }
                this.currentPage = 1;
                this.CREATE_EVENT_ALARM_RULE({
                    eventKey: 'businessAlarm:'+this.eventAlarmData.key,
                    serviceId: this.currentNode.data.key,
                    silencePeriod: this.eventAlarmData.delayTime,
                    disabled: false
                }).then(() => {
                    successEvent('添加成功');
                    this.getEventAlarmRules(this.currentNode, this.currentPage)
                });
                this.dialogFormVisible = false;
            } else {
                return false;
            }
        })
    }

    @Watch('durationTime')
    private watchDurationTime(newValue: DurationTime, oldValue: DurationTime) {
      // Avoid repeating fetchData() after enter the component for the first time.
      if (compareObj(newValue, oldValue)) {
        this.GET_ROOT_DATA({duration: newValue});
        this.showAlarm = false;
      }
    }
    public created() {
      this.GET_ROOT_DATA({duration: this.durationTime}).then(() => {
          /*this.$nextTick(() => {
              this.$refs.treeData.data.forEach((item) => {
                  this.$refs.treeData.setCurrentKey('41')
              })
          })*/
      })
    }
  }
</script>

<style lang="scss" scoped>


  .del-btn {
    display: none;
    margin-left: 20px;
  }
  .strategys-content {
    display: flex;
    cursor: pointer;
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
    &:hover {
      .del-btn {
        display: block;
      }
    }
  }
  .switch-btn {
    height: 100%;
    line-height: 100%;
  }
  .rk-title {
    padding: 10px 10px;
    font-size: 14px;
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
  .rk-loading{
    text-align: center;
    width: 100%;
    height: 70px;
    position: absolute;
    left: 10%;
    line-height: 88px;
    overflow: hidden;
    .icon{
      width: 30px;
      height: 30px;
    }
  }
</style>
