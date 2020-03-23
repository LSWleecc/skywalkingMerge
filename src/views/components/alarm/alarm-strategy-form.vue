<template>
  <div style="width: 100%">
    <el-form :model="ruleForm" :rules="rule" ref="ruleForm" label-width="100px" class="demo-ruleForm">
      <el-form-item style="margin-top: 10px" label="度量名" prop="name">
        <el-select v-model="ruleForm.name" :disabled="isDisable" @change="changeMetric" placeholder="请选择度量名">
          <el-option v-for="(item,index) in rocketAlarm.metricNames" :key="index" :value="item.key"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item :label="ruleForm.name == 'service_sla' ? '阈值（%）': '阈值（ms）'" prop="region">
        <el-input-number :precision="ruleForm.name == 'service_sla' ? 2 : 0" v-model="ruleForm.region" controls-position="right" :min="0" :max="ruleForm.name == 'SLA' ? 100 : Infinity">%</el-input-number>
      </el-form-item>
      <el-form-item label="操作符" prop="operator">
        <el-radio-group v-model="ruleForm.operator">
          <el-radio label=">"></el-radio>
          <el-radio label="<"></el-radio>
          <el-radio label="=="></el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item style="margin-left: -100px">
        <el-col :span="6">
          <el-form-item label="周期" prop="intervalTime">
            <el-input-number v-model="ruleForm.intervalTime" controls-position="right" :min="1" :max="10"></el-input-number>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="次数" prop="count">
            <el-input-number v-model="ruleForm.count" controls-position="right" :min="1" :max="10"></el-input-number>
          </el-form-item>
        </el-col>
      </el-form-item>
      <el-form-item>
        <el-col :span="6">
          <el-form-item>
            <el-checkbox v-model="ruleForm.notifyChannel">短信通知</el-checkbox>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item>
            <el-checkbox v-model="ruleForm.includeError">包含错误消息</el-checkbox>
          </el-form-item>
        </el-col>
      </el-form-item>

      <el-form-item label="延迟期" prop="region">
        <el-input-number v-model="ruleForm.delayTime" controls-position="right" :min="1" :max="10"></el-input-number>
      </el-form-item>

      <el-form-item label="报警消息" prop="alarmMessage">
        <el-col :span="12">
          <el-input @blur="switchAlarmMessage" @focus="changeAlarmMessage" type="textarea" v-model="ruleForm.alarmMessage"></el-input>
        </el-col>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="submitForm('ruleForm')">立即创建</el-button>
        <el-button @click="resetForm('ruleForm')">取消</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script lang="ts">
  import {Vue, Component, Prop, Watch} from 'vue-property-decorator';
  import {Action, Getter, Mutation, State} from "vuex-class";
  import { errEvent, successEvent } from  '../../../utils/util';
  @Component({
    components: {
    }
  })
  export default class StrategyManage extends Vue {
    @State('rocketAlarm') private rocketAlarm!: any;
    @Action('rocketAlarm/ADD_METRIC_ALARM_RULE') private ADD_METRIC_ALARM_RULE!: any;
    @Action('rocketAlarm/SEARCH_METRIC_LIST') private SEARCH_METRIC_LIST: any;
    @Action('rocketAlarm/GET_METRIC_ALARM_RULE') private GET_METRIC_ALARM_RULE: any;
    @Action('rocketAlarm/UPDATE_METRIC_ALARM_RULE') private UPDATE_METRIC_ALARM_RULE: any;

    public currentNode: any ;
    public currentMetric: any ;
    public type: string  = '';
    public ruleForm = {
      name: '',
      region: '',
      operator: '>',
      intervalTime: '',
      count: '',
      notifyChannel: true,
      includeError: true,
      delayTime: '',
      alarmMessage: ''
    };
    public rule = {
      name: [
        { required: true, message: '请选择度量名称', trigger: 'change' },
      ],
      region: [
        { required: true, message: '请填写阈值', trigger: 'change' }
      ],
      operator: [
        { required: true, message: '请选择操作符', trigger: 'change' }
      ],
      intervalTime: [
        {required: true, message: '请填写周期', trigger: 'change'}
      ],
      count: [
        {required: true, message: '请填写次数', trigger: 'change'}
      ],
      delayTime: [
        {required: true, message: '请填延期值', trigger: 'change'}
      ],
      alarmMessage: [
        { required: true, message: '请填写活动形式', trigger: 'blur' }
      ]
    };
    public isDisable: boolean = false;
    public templateMessage = true;
    public changeMetric(value:any) {
      this.ruleForm.region = '';
    }
    public switchAlarmMessage() {
        this.templateMessage = true;
    }
    public changeAlarmMessage(value: string) {
        this.templateMessage = false;
    }
      @Watch('ruleForm', { deep: true })
      private ruleFormChanged(newVal: any, oldVal: any): void {
          if(this.templateMessage) {
              if(this.currentNode) {
                  if(this.type == 'add') {
                      this.ruleForm.alarmMessage =  `服务${this.currentNode.data.label}在最近${this.ruleForm.intervalTime}分钟内${this.ruleForm.name}连续${this.ruleForm.count}次${this.ruleForm.operator == '>' ? '大于' : this.ruleForm.operator == '<' ? '小于' : '等于' }阈值${this.ruleForm.region}${this.ruleForm.name == 'service_sla' ? '%' : '毫秒'}`;
                  }
              }
          }else {
              this.ruleForm.alarmMessage = newVal.alarmMessage;
          }
      }
    public submitForm(ruleForm:any) {
      (this.$refs.ruleForm as any).validate(async (valid:boolean) => {
        if (valid) {
            if(this.type == 'add') {
                const check =  this.rocketAlarm.Strategylist.some((item: any) => {
                    if(item.metricsName == this.ruleForm.name) {
                        return true;
                    }
                });
                if(check) {
                    errEvent('该策略已存在');
                    return;
                }else {
                    await  this.addMetricAlarmRule()
                }
            }
            if(this.type == 'edit') {
              await this.editMetricAlarmRule(this.currentMetric.id)
            }
        } else {
          console.log('error submit!!');
          return false;
        }
      })
    }

    public addMetricAlarmRule() {
        this.ADD_METRIC_ALARM_RULE({
            metricsName: this.ruleForm.name,
            scope:this.currentNode.level == 1 ? 'Service' : 'Endpoint',
            entityId: this.currentNode.data.key,
            serviceId: this.currentNode.data.key,
            threshold: this.ruleForm.region.toString(),
            op: this.ruleForm.operator,
            period: this.ruleForm.intervalTime,
            count: this.ruleForm.count,
            silencePeriod: this.ruleForm.delayTime,
            message: this.ruleForm.alarmMessage,
            includeError: this.ruleForm.includeError,
            notifySMS: this.ruleForm.notifyChannel
        }).then(() => {
            successEvent('添加成功');
           this.SEARCH_METRIC_LIST({
                scope: this.currentNode.level == 1 ? 'Service' : 'Endpoint',
                entityId: this.currentNode.data.key,
                paging: {
                    pageNum: 1,
                    pageSize: 20,
                    needTotal: true,
                }}).then(() => {
               this.$eventBus.$emit('HIDDEN_STRATEGY_FORM', false);
           })
        })
    }
    public editMetricAlarmRule(id: string) {
        this.UPDATE_METRIC_ALARM_RULE({
            id: id,
            threshold: this.ruleForm.region.toString(),
            op: this.ruleForm.operator,
            period: this.ruleForm.intervalTime,
            count: this.ruleForm.count,
            silencePeriod: this.ruleForm.delayTime,
            message: this.ruleForm.alarmMessage,
            includeError: this.ruleForm.includeError,
            notifySMS: this.ruleForm.notifyChannel
        }).then(() => {
            successEvent('修改成功');
            this.SEARCH_METRIC_LIST({
                scope: this.currentNode.level == 1 ? 'Service' : 'Endpoint',
                entityId: this.currentNode.data.key,
                paging: {
                    pageNum: 1,
                    pageSize: 20,
                    needTotal: true,
                }
            }).then(() => {
                this.$eventBus.$emit('HIDDEN_STRATEGY_FORM', false);
            })
        })
    }
    public resetForm(ruleForm:any) {
        this.$eventBus.$emit('HIDDEN_STRATEGY_FORM', false);
    }
    private created(){
        this.$eventBus.$on('EDIT_STRATEGY_FORM', this, ({i, node}) => {
          this.currentMetric = i;
          this.currentNode = node;
          this.isDisable = true;
          this.type = 'edit';
          this.GET_METRIC_ALARM_RULE({id: i.id}).then((res: any) => {
              this.ruleForm.name = res.metricsName;
              this.ruleForm.region = res.threshold;
              this.ruleForm.operator = res.op;
              this.ruleForm.intervalTime = res.period;
              this.ruleForm.count = res.count;
              this.ruleForm.notifyChannel = res.notifySMS;
              this.ruleForm.includeError = res.includeError;
              this.ruleForm.delayTime = res.silencePeriod;
              this.ruleForm.alarmMessage = res.message;
          });
        });
        this.$eventBus.$on('ADD_METRIC', this, (i:any): void => {
            this.currentNode = i;
            this.type = 'add';
            this.isDisable = false;
            (this.$refs.ruleForm as any).resetFields();
        });
    }
  }
</script>

<style lang="scss" scoped>

</style>
