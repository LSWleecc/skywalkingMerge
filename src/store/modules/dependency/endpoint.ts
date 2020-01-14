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

import {Value} from '@/types/dashboard';

export interface State {
  endpointResponseTime: { ResponseTime: number[]; };
  endpointSLA: { SLA: number[]; };
}

export const initState: State = {
  endpointResponseTime: {ResponseTime: []},
  endpointSLA: {SLA: []},
};


export const SetEndpoint = (state: State, params: any) => {
  if (params && params.endpointResponseTime) {
    state.endpointResponseTime.ResponseTime = params.endpointResponseTime.values.map((i: Value) => i.value);
  }
  if (params && params.endpointSLA) {
    state.endpointSLA.SLA = params.endpointSLA.values.map((i: Value) => i.value / 100);
  }
};
