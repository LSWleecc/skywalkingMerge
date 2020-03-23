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

import { Alarm, MetricsAlarm , CreateMetric, getMetric, updateMetric, disableMetric, createEvent, disableEventAlarm, updateEvent, load, switchDisableMetric } from '../fragments/alarm';

export const queryAlarms =
  `query queryAlarms(${Alarm.variable}) {${Alarm.query}}`;
export const searchMetricsAlarmRules =
  `query queryMetricsAlarmRules(${MetricsAlarm.variable}) {${MetricsAlarm.query}}`;
export const createMetricsAlarmRule =
    `mutation createMetricsAlarmRules(${CreateMetric.variable}) {${CreateMetric.query}}`;
export const getMetricAlarmRule =
    `query getMetricAlarmRule(${getMetric.variable}) {${getMetric.query}}`;
export const updateMetricAlarmRule =
    `mutation updateMetricAlarmRule(${updateMetric.variable}) {${updateMetric.query}}`;
export const deleteMetricsAlarmRule =
    `mutation deleteMetricsAlarmRule( $id: ID! ) { deleteMetricsAlarmRule(id: $id) }`;
export const disableMetricsAlarmRule =
    `mutation disableMetricsAlarmRule(${disableMetric.variable}) {${disableMetric.query}}`;
export const createEventAlarmRule =
    `mutation createEventAlarmRule(${createEvent.variable}) {${createEvent.query}}`;
export const deleteEventAlarmRule =
    `mutation deleteEventAlarmRule( $id: ID!) { deleteEventAlarmRule(id: $id) }`;
export const disableEventAlarmsRule =
    `mutation disableEventAlarmRule(${disableEventAlarm.variable}) {${disableEventAlarm.query}}`;
export const updateEventAlarmRule =
    `mutation updateEventAlarmRule(${updateEvent.variable}) {${updateEvent.query}}`;
export const loadTree =
    `query getEndpoints(${load.variable}) {${load.query}}`;
export const disableMetricsAlarmRules =
    `mutation disableMetricsAlarmRules( $ids: [ID!]!, $disabled: Boolean!) { disableMetricsAlarmRules( ids:$ids, disabled: $disabled )}`;
export const disableMetricsAlarmRulesInService =
    `mutation disableMetricsAlarmRulesInService( $serviceId: ID!, $disabled: Boolean!) { disableMetricsAlarmRulesInService( serviceId:$serviceId, disabled: $disabled )}`;
export const disableEventAlarmRulesInService =
    `mutation disableEventAlarmRulesInService( $serviceId: ID!, $disabled: Boolean!) { disableEventAlarmRulesInService( serviceId:$serviceId, disabled: $disabled )}`;