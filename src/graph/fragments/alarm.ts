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

export const Alarm = {
  variable: '$keyword: String, $scope: Scope, $duration:Duration!, $paging: Pagination!',
  query: `
    getAlarm(keyword: $keyword, scope: $scope, duration: $duration, paging: $paging) {
      items: msgs {
        key: id
        message
        startTime
        scope
      }
      total
    }`};
export const MetricsAlarm = {
    variable: '$scope: Scope, $serviceId: ID!, $paging:Pagination!, $disabled: Boolean',
    query: `
    searchMetricsAlarmRules(scope: $scope, serviceId: $serviceId, paging: $paging, disabled: $disabled) {
      rules {
        id
        metricsName
        scope
        entityId
        serviceId
        threshold
        op
        period  
        count
        silencePeriod
        message
        includeError
        disabled
        notifySMS
        notifyDisabled
      }
      total
    }`};
export const EventAlarm = {
    variable: '$serviceId: ID!, $paging:Pagination!',
    query: `
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
    }`};
export const MetricAlarm = {
    variable: '$id: ID!',
    query: `
    searchEventAlarmRules(id: $id) {
      rules: {
        id
        alarmRuleName
        eventKey
        serviceID
        silencePeriod
        disabled
        notifySMS
        notifyDisabled
        createTime
        lastUpdateTime
      }
      total
    }`};
export const CreateMetric = {
    variable: '$metricsName: String!, $scope: Scope!, $entityId: String!, $serviceId: String!, $threshold: String, $op: String, $period: Int!, $count: Int!, $silencePeriod: Int!, $message: String, $includeError: Boolean, $disabled: Boolean, $notifySMS: Boolean, $notifyDisabled: Boolean',
    query: `
    createMetricsAlarmRule(metricsName: $metricsName, scope: $scope, entityId: $entityId, serviceId: $serviceId, threshold: $threshold, op: $op, period: $period ,count: $count, silencePeriod: $silencePeriod, message: $message, disabled: $disabled, notifyDisabled: $notifyDisabled, includeError: $includeError, notifySMS: $notifySMS) {
      id
      metricsName
      scope
      entityId
      serviceId
      threshold
      op
      period
      count
      silencePeriod
      message
      includeError
      notifySMS
    }`};
export const getMetric = {
    variable: '$id: ID!',
    query: `
    getMetricsAlarmRule(id: $id) {
      id
      metricsName
      scope
      entityId
      serviceId
      threshold
      op
      period
      count
      silencePeriod
      message
      includeError
      notifySMS
    }`};

export const updateMetric = {
    variable: '$id: ID!, $threshold: String, $op: String, $period: Int!, $count: Int!, $silencePeriod: Int!, $message: String, $includeError: Boolean, $disabled: Boolean, $notifySMS: Boolean, $notifyDisabled: Boolean',
    query: `
    updateMetricsAlarmRule(id: $id, threshold: $threshold, op: $op, period: $period ,count: $count, silencePeriod: $silencePeriod, message: $message, disabled: $disabled, notifyDisabled: $notifyDisabled, includeError: $includeError, notifySMS: $notifySMS) {
      id
      metricsName
      scope
      entityId
      serviceId
      threshold
      op
      period
      count
      silencePeriod
      message
      includeError
      notifySMS
    }`};