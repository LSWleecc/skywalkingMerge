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

import { Alarm, MetricsAlarm, EventAlarm , MetricAlarm, CreateMetric, getMetric, updateMetric} from '../fragments/alarm';

export const queryAlarms =
  `query queryAlarms(${Alarm.variable}) {${Alarm.query}}`;
export const searchMetricsAlarmRules =
  `query queryMetricsAlarmRules(${MetricsAlarm.variable}) {${MetricsAlarm.query}}`;
export const searchEventAlarmRules =
    `query queryEventAlarmRules(${EventAlarm.variable}) {${EventAlarm.query}}`;
export const getMetricsAlarmRules =
    `query queryMetricsAlarmRules(${MetricAlarm.variable}) {${EventAlarm.query}}`;
export const createMetricsAlarmRule =
    `mutation createMetricsAlarmRules(${CreateMetric.variable}) {${CreateMetric.query}}`;
export const getMetricAlarmRule =
    `query getMetricAlarmRule(${getMetric.variable}) {${getMetric.query}}`;
export const updateMetricAlarmRule =
    `mutation updateMetricAlarmRule(${updateMetric.variable}) {${updateMetric.query}}`;