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

import graph from '@/graph';
import * as types from '@/store/mutation-types';
import { Option } from '@/types/global';
import { Span, Trace, caller } from '@/types/topo';
import {initState as global, SetGlobal} from './global';
import {initState as endpoint, SetEndpoint} from './endpoint';
import { ActionTree, Commit, Dispatch, MutationTree } from 'vuex';
import axios from 'axios';
import {AxiosPromise, AxiosResponse} from 'axios';
import {cancelToken} from '@/utils/cancelToken';
import fragmentAll from './fragments';
import service from '@/utils/config-service';

export interface State {
    services: Option[];
    currentService: any;
    endpoints: Option[];
    currentEndpoint: any;
    traceForm: any;
    traceList: caller[];
    traceTotal: number;
    traceSpans: Span[];
    currentTrace: any;

    globalPercent: {
        times: number[];
    };
    endpointResponseTime: { ResponseTime: number[]; };
    endpointSLA: { SLA: number[]; };
    chartList: object[];
}

const initState: State = {
    services: [],
    currentService: {},
    endpoints: [],
    currentEndpoint: {},
    traceForm: {
        paging: {pageNum: 1, pageSize: 15, needTotal: true},
        queryOrder: localStorage.getItem('traceQueryOrder') || 'BY_DURATION',
    },
    traceList: [],
    traceTotal: 0,
    traceSpans: [],
    currentTrace: {
        name: '',
        id: '',
        value: 0,
        serviceId: '',
        serviceName: ''
    },

    globalPercent: {
        times: []
    },
    endpointResponseTime: {ResponseTime: []},
    endpointSLA: {SLA: []},
    chartList: [
        {   c:'ChartLine',
            d:"globalPercent",
            h:250,
            o:'Endpoint',
            t:"Endpoint Percent Response(调用次数)",
            w:6,
        },
        {
            c:"ChartLine",
            d:"endpointResponseTime",
            h:250,
            o:"ServiceEndpoint",
            t:"Endpoint ResponseTime(响应时间)",
            w:6,
        },
        {
            c:"ChartBar",
            d:"endpointSLA",
            h:250,
            o:"ServiceEndpoint",
            t:"Endpoint SLA(成功率)",
            w:6,
        }
    ],
    ...global,
    ...endpoint,
};
const EndPointInfoGraphql = `
query getEndpointInfo($endpointId: ID!) {
        endpointInfo: getEndpointInfo(endpointId: $endpointId) {
            serviceName
            id
    }}
`;
// getters
const getters = {
    Graphql(state: State): string {
        let fragmentsArr: any = [];
        let variablesArr: any = [];
        state.chartList.forEach((i: any) => {
            const globalArr: any = fragmentAll;
            if (globalArr[i.d]) {
                fragmentsArr = [...fragmentsArr, globalArr[i.d].fragment];
            }
            if (globalArr[i.d]) {
                variablesArr = [...variablesArr, ...globalArr[i.d].variable];
            }
        });
        const fragments = Array.from(new Set(fragmentsArr)).join('');
        const variables = Array.from(new Set(variablesArr)).join(',');
        return `query queryData(${variables}) {${fragments}}`;
    },
};

// mutations
const mutations: MutationTree<State> = {
    [types.SET_DEPENDENCY_SERVICE](state: State, data: Option[] ): void {
        state.services = data;
        if (!state.currentService.key && data.length) {
            state.currentService = data[0];
        }
    },
    [types.SET_ENDPOINT](state: State, data: Option[]): void {
        state.endpoints = data;
        if (!data.length) {
            state.currentEndpoint = {};
            return;
        }
        if (!state.currentEndpoint.key && data.length ) {
            state.currentEndpoint = data[0];
        }
    },
    [types.SET_TRACE_FORM](state: State, data: any): void {
        state.traceForm = data;
    },
    [types.SET_TRACE_FORM_ITEM](state: State, params: any): void {
        if (params.type && params.type === 'queryOrder') {
            if (params.data === '') {
                params.data = 'BY_DURATION';
                localStorage.setItem('traceQueryOrder', 'BY_DURATION');
            } else {
                localStorage.setItem('traceQueryOrder', params.data);
            }
        }
        state.traceForm[params.type] = params.data;
    },
    [types.SET_TRACELIST](state: State, data: caller[]): void {
        state.traceList = data;
    },
    [types.SET_TRACELIST_TOTAL](state: State, data: number): void {
        state.traceTotal = data;
    },
    [types.SET_TRACE_SPANS](state: State, data: Span[]): void {
        state.traceSpans = data;
    },
    [types.SET_CURRENT_TRACE](state: State, data: caller): void {
        state.currentTrace = data;
    },
    [types.SET_DEFAULT_EMPTY_TRACE](state: State): void {
        state.currentTrace = {
            name: '',
            id: '',
            value: 0,
            serviceId: '',
            serviceName: ''
        };
    },
    [types.SET_CURRENTINVOK_SERVICE](state: State, service: any) {
        state.currentService = service;
    },
    [types.SET_CURRENTINVOK_ENDPOINT](state: State, endpoint: any) {
        state.currentEndpoint = endpoint;
    },
    DEPEND_COOK_SOURCE(state: State, params: any) {
        SetGlobal(state, params);
        SetEndpoint(state, params);
    },
};

// actions
const actions: ActionTree<State, any> = {
    GET_SERVICES(context: { commit: Commit , dispatch: Dispatch, state: any}, params: any): Promise<void> {
        return graph
            .query('queryServices')
            .params(params)
            .then((res: AxiosResponse) => {
                context.commit(types.SET_DEPENDENCY_SERVICE, res.data.data.services)
            })
    },
    GET_SERVICE_ENDPOINTS(context: { commit: Commit, state: any }): Promise<void> {
        if (!context.state.currentService.key) {
            return new Promise((resolve) => resolve());
        }
        return graph
            .query('queryEndpoints')
            .params({serviceId: context.state.currentService.key, keyword: ''})
            .then((res: AxiosResponse) => {
                context.commit(types.SET_ENDPOINT, res.data.data.getEndpoints);
            });
    },

    SET_TRACE_FORM(context: { commit: Commit, dispatch: Dispatch ,state: any}, params: any): void {
        context.commit(types.SET_TRACE_FORM, params);
    },
    GET_DEPENDENCY_LIST(context: { state: State, commit: Commit }, params: any): Promise<void> {
        context.commit(types.SET_TRACELIST, []);
        return graph
            .query('queryDependencyEndpoint')
            .params(params)
            .then((res: AxiosResponse) => {
                context.commit(types.SET_TRACELIST, res.data.data.getDependencyEndpoints.entities);
                context.commit(types.SET_TRACELIST_TOTAL, res.data.data.getDependencyEndpoints.total);
            });
    },
    GET_TRACE_SPANS(context: { commit: Commit }, params: any): Promise<void> {
        context.commit(types.SET_TRACE_SPANS, []);
        return graph
            .query('queryTrace')
            .params(params)
            .then((res: AxiosResponse) => {
                context.commit(types.SET_TRACE_SPANS, res.data.data.trace.spans);
            });
    },

    MIXHANDLE_GET_OPTION(context: { commit: Commit, dispatch: Dispatch, state: State, getters: any }, params: any) {
        return context.dispatch('GET_SERVICES', {duration: params.duration})
            .then(() => context.dispatch('GET_SERVICE_ENDPOINTS'))
    },
    SELECT_SERVICE(context: { commit: Commit, dispatch: Dispatch }, params: any) {
        context.commit('SET_CURRENTINVOK_SERVICE', params.service);
        // context.dispatch('MIXHANDLE_GET_OPTION', {...params });
        context.dispatch('GET_SERVICE_ENDPOINTS')
    },
    SELECT_ENDPOINT(context: { commit: Commit, dispatch: Dispatch, state: any }, params: any) {
        context.commit('SET_CURRENTINVOK_ENDPOINT', params.endpoint);
    },
    GET_QUERY(context: { commit: Commit, dispatch: Dispatch, getters: any }, variablesData: any): AxiosPromise<void> {

        const queryData = {
            query: context.getters.Graphql,
            variables: variablesData,
        };
        return service({
            method: 'post',
            url: '/graphql',
            data:  queryData,
            cancelToken: cancelToken()
        }).then((res: AxiosResponse<any>) => {
            const resData = res.data;
            if (resData.data && resData.data.endpointTopology) {
                const endpointIds = resData.data.endpointTopology.nodes.map((n: any) => n.name).filter(
                    function onlyUnique(value: any, index: number, self: any) {
                        return self.indexOf(value) === index;
                    },
                );
                Promise.all(
                    endpointIds.map((id: any) => {
                        const queryData = {
                            query: EndPointInfoGraphql,
                            variables: {endpointId: `${id}`}
                        }
                        return service({
                            method: 'post',
                            url: '/graphql',
                            data: queryData
                        }).then((endpointRes: AxiosResponse<any>) => {
                            return endpointRes.data.data.endpointInfo;
                        });
                    }),
                ).then((endpointInfos) => {
                    resData.data.endpointTopology.endpoints = endpointInfos;
                    context.dispatch('DEPEND_COOK_SOURCE', resData);
                });
            } else {
                context.dispatch('DEPEND_COOK_SOURCE', resData);
            }
            return res;
        })
    },
    DEPEND_COOK_SOURCE(context: { commit: Commit }, params: any) {
        context.commit('DEPEND_COOK_SOURCE', params.data);
    },
};

export default {
    namespaced: true,
    state: initState,
    getters,
    actions,
    mutations,
};
