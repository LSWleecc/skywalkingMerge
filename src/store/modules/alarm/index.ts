/**
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {Commit, ActionTree, MutationTree, Dispatch} from 'vuex';
import * as types from '@/store/mutation-types';
import { AxiosResponse } from 'axios';
import graph from '@/graph';
import { Alarm, AlarmParams } from '@/types/alarm';

export interface State {
  alarmService: Alarm[];
  total: number;
    /*-------------*/
  tree: object[];
  group: number;
  rootData: object[];
  Strategylist: object[];
  metricNames: object[];
}

const initState: State = {
  alarmService: [],
  total: 0,
    /*-------------*/
  tree: [{type: 'Strategy', name: 'Strategy'},{type: 'Alarm', name: 'Alarm'} ],
  group: 0,
  rootData: [],
  Strategylist: [],
  metricNames: [{key: 'service_resp_time', label: 'serviceResponseTime'}, {key: 'service_cpm', label: 'serviceThroughput'}, {key : 'service_sla', label: 'serviceSLA'}, {key: 'service_p99', label: 'serviceP99'}, {key: 'service_p95', label: 'serviceP95'} ,{key: 'service_p90', label: 'serviceP90'} ,{key: 'service_p75', label: 'serviceP75'} ,{key: 'service_p50', label: 'serviceP50'}],

};

// getters
const getters = {};

// mutations
const mutations: MutationTree<State> = {
  [types.SET_ALARM](state: State, data: Alarm[]): void {
    state.alarmService = data;
  },
  [types.SET_ALARM_TOTAL](state: State, total: number): void {
    state.total = total;
  },
  [types.CLEAR_ALARM](state: State): void {
    state.alarmService = [];
  },
/*-------------*/
  [types.MIXHANDLE_CHANGE_GROUP](state: State, data: any): void {
      state.group = data;
  },
  [types.SET_ROOT_DATA](state: State, data: any) {
      state.rootData = data
  },
  [types.SET_ALARM_STRATEGY_LIST](state: State, data: any):void {
      state.Strategylist = data
  },

};

// actions
const actions: ActionTree<State, any> = {
  GET_ALARM(context: { commit: Commit; state: State}, params: AlarmParams): Promise<void> {
    return graph
      .query('queryAlarms')
      .params(params)
      .then((res: AxiosResponse<any>) => {
        if (res.data.data.getAlarm.items) {
          context.commit(types.SET_ALARM, res.data.data.getAlarm.items);
          context.commit(types.SET_ALARM_TOTAL, res.data.data.getAlarm.total);
        }
      });
  },
  CLEAR_ALARM(context: { commit: Commit; state: State }): void {
    context.commit(types.CLEAR_ALARM);
  },
/*-----*/
  GET_ROOT_DATA(context: {commit: Commit}, params: any): Promise<void> {
      return graph
          .query('queryServices')
          .params(params)
          .then((res: AxiosResponse) => {
              context.commit(types.SET_ROOT_DATA, res.data.data.services);
          })
          .catch(()=>{

          })
  },
    SEARCH_METRIC_LIST(context: {commit: Commit}, params: any): Promise<void> {
      return graph
          .query('searchMetricsAlarmRules')
          .params(params)
          .then((res: AxiosResponse) => {
              context.commit(types.SET_ALARM_STRATEGY_LIST, res.data.data.searchMetricsAlarmRules.rules);
          })
  },
    ADD_METRIC_ALARM_RULE(context: {commit: Commit, dispatch: Dispatch}, params: any): Promise<void> {
      return graph
          .query('createMetricsAlarmRule')
          .params(params)
          .then((res: AxiosResponse) => {

          })
    },
    GET_METRIC_ALARM_RULE(context: {commit: Commit, dispatch: Dispatch}, params: any): Promise<void> {
        return graph
            .query('getMetricAlarmRule')
            .params(params)
            .then((res: AxiosResponse) => {
                return res.data.data.getMetricsAlarmRule;
            })
    },
    UPDATE_METRIC_ALARM_RULE(context: {commit: Commit, dispatch: Dispatch}, params: any): Promise<void> {
        return graph
            .query('updateMetricAlarmRule')
            .params(params)
            .then((res: AxiosResponse) => {

            })
    },
    DEL_METRIC_ALARM_RULE(context: {commit: Commit}, params: any): Promise<void> {
        return graph
            .query('deleteMetricsAlarmRule')
            .params(params)
            .then((res: AxiosResponse) => {

            })
    },
    SWITCH_METRIC_ALARM_RULE(context: {commit: Commit}, params: any): Promise<void>  {
        return graph
            .query('disableMetricsAlarmRule')
            .params(params)
            .then((res: AxiosResponse) => {

            })
    },
    CREATE_EVENT_ALARM_RULE(context: {commit: Commit}, params: any): Promise<void> {
        return graph
            .query('createEventAlarmRule')
            .params(params)
            .then((res: AxiosResponse) => {

            })
    },
    DEL_EVENT_ALARM_RULE(context: {commit: Commit}, params: any): Promise<void> {
        return graph
            .query('deleteEventAlarmRule')
            .params(params)
            .then((res: AxiosResponse) => {

            })
    },
    SWITCH_EVENT_ALARM_RULE(context: {commit: Commit}, params: any): Promise<void>  {
        return graph
            .query('disableEventAlarmsRule')
            .params(params)
            .then((res: AxiosResponse) => {

            })
    },
    UPDATE_EVENT_ALARM_RULE(context: {commit: Commit}, params: any): Promise<void> {
        return graph
            .query('updateEventAlarmRule')
            .params(params)
            .then((res: AxiosResponse) => {

            })
    },
    LOAD_CHILD_NODE(context: {commit: Commit}, params: any): Promise<void> {
        return graph
            .query('loadTree')
            .params(params)
            .then((res: AxiosResponse) => {
                params.resolve(res.data.data.searchEndpoint);
            })
    },
    SWITCH_DISABLE_METRICS(context: {commit: Commit}, params: any): Promise<void> {
        return graph
            .query('disableMetricsAlarmRules')
            .params(params)
            .then((res: AxiosResponse) => {

            })
    },
    SWITCH_METRICS_ALARM_RULES_SERVICES(context: {commit: Commit}, params: any): Promise<void> {
        return graph
            .query('disableMetricsAlarmRulesInService')
            .params(params)
            .then((res: AxiosResponse) => {

            })
    },
    SWITCH_EVENT_ALARM_RULES_SERVICES(context: {commit: Commit}, params: any): Promise<void> {
        return graph
            .query('disableEventAlarmRulesInService')
            .params(params)
            .then((res: AxiosResponse) => {

            })
    }
};

export default {
  namespaced: true,
  state: initState,
  getters,
  actions,
  mutations,
};
