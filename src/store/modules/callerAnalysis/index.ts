import graph from '@/graph';
import * as types from '@/store/mutation-types';
import { Option } from '@/types/global';
import { caller } from '@/types/topo';
import {AxiosPromise, AxiosResponse} from 'axios';
import { ActionTree, Commit, Dispatch, MutationTree } from 'vuex';
import {initState as global, SetGlobal} from './global';

export interface State {
    services: Option[];
    currentService: any;
    endpoints: Option[];
    currentEndpoint: any;
    traceForm: any;
    invokTraceList: caller[];
    traceTotal: number;
    currentTrace: any;
    globalPercent: {
        times: number[]
    };
    invokChartList: any;
}

const initState: State = {
    services: [],
    currentService: {key: '', label: ''},
    endpoints: [],
    currentEndpoint: {},
    traceForm: {
        paging: {pageNum: 1, pageSize: 15, needTotal: true},
    },
    invokTraceList: [],
    traceTotal: 0,
    currentTrace: {},
    invokChartList: [
        {   c:'ChartLine',
            d:"globalPercent",
            h:360,
            o:'Service',
            t:"Service Percent Response (调用次数)",
            w:12,
        }
    ],
    globalPercent: {
        times: []
    },
    ...global,

};

// getters
const getters = {

};

// mutations
const mutations: MutationTree<State> = {
    [types.SET_CALLER_ANALYSIS_SERVICE](state: State, data: Option[] ): void {
        state.services = data;
        if (!state.currentService.key && data.length) {
            state.currentService = data[0];
        }
    },
    [types.SET_CALLER_ENDPOINT](state: State, data: Option[]): void {
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
    [types.SET_CALLER_LIST](state: State, data: caller[]): void {
        state.invokTraceList = data;
    },
    [types.SET_CALLER_TOTAL](state: State, data: number): void {
        state.traceTotal = data;
    },

    [types.SET_CURRENT_TRACE](state: State, data: caller): void {
        state.currentTrace = data;
    },
    [types.SET_DEFAULT_EMPTY_TRACE](state: State): void {
        state.currentTrace = {};
    },
    [types.SET_CURRENTCALLER_SERVICE](state: State, service: any) {
        state.currentService = service;
    },
    [types.SET_CURRENTCALLER_ENDPOINT](state: State, endpoint: any) {
        state.currentEndpoint = endpoint;
    },

    INVOK_COOK_SOURCE(state: State, params: any) {
        SetGlobal(state, params.data);
    },
};

// actions
const actions: ActionTree<State, any> = {
    GET_SERVICES(context: { commit: Commit , dispatch: Dispatch, state: any}, params: any): Promise<void> {
        return graph
            .query('queryServices')
            .params(params)
            .then((res: AxiosResponse) => {
                context.commit(types.SET_CALLER_ANALYSIS_SERVICE, res.data.data.services)
            })
            .catch((err) => {
                console.log(err)
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
                context.commit(types.SET_CALLER_ENDPOINT, res.data.data.getEndpoints);
            })
    },
    SET_TRACE_FORM(context: { commit: Commit, dispatch: Dispatch ,state: any}, params: any): void {
        context.commit(types.SET_TRACE_FORM, params);
    },
    GET_INVOKLIST(context: { state: State, commit: Commit ,dispatch: Dispatch}, params: any): Promise<void> {
        context.commit(types.SET_CALLER_LIST, [])
        return graph
            .query('queryServiceList')
            .params(params)
            .then((res: AxiosResponse) => {
                context.commit(types.SET_CALLER_LIST, res.data.data.getConsumerServices.entities);
                context.commit(types.SET_CALLER_TOTAL, res.data.data.getConsumerServices.total);
            })
            .catch((err) => {
                console.log(err)
            })
    },
    MIXHANDLE_GET_OPTION(context: { commit: Commit, dispatch: Dispatch, state: State, getters: any }, params: any) {
        return context.dispatch('GET_SERVICES', {duration: params.duration})
            .then((res) => context.dispatch('GET_SERVICE_ENDPOINTS'))
            .catch((err) => {
                console.log(err)
            })
    },
    SELECT_SERVICE(context: { commit: Commit, dispatch: Dispatch }, params: any) {
        context.commit('SET_CURRENTCALLER_SERVICE', params.service);
        context.dispatch('GET_SERVICE_ENDPOINTS')
    },
    SELECT_ENDPOINT(context: { commit: Commit, dispatch: Dispatch, state: any }, params: any) {
        context.commit('SET_CURRENTCALLER_ENDPOINT', params.endpoint);
    },
    GET_QUERY(context: { commit: Commit, dispatch: Dispatch, getters: any }, variablesData: any): Promise<void> {
        return graph
            .query('queryServiceChart')
            .params(variablesData)
            .then((res: AxiosResponse) => {
                context.commit('INVOK_COOK_SOURCE', res.data);
            })
            .catch((err) => {
                console.log(err)
            })
    },
};

export default {
    namespaced: true,
    state: initState,
    getters,
    actions,
    mutations,
};
