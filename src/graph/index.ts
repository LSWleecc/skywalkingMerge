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

import axios, { AxiosPromise } from 'axios';
import { cancelToken } from '@/utils/cancelToken';
import * as option from './query/option';
import * as trace from './query/trace';
import * as topology from './query/topology';
import * as alarm from './query/alarm';
import service from '../utils/config-service';

const query: any = {
  ...option,
  ...trace,
  ...topology,
  ...alarm,
};

class Graph {
  private queryData: string = '';
  public query(queryData: string) {
    this.queryData = queryData;
    return this;
  }
  // public unTokenParams(variablesData: any): AxiosPromise<void> {
  //   return axios.post('/graphql', {
  //     query: query[this.queryData],
  //     variables: variablesData,
  //   }, { cancelToken: cancelToken() });
  // }
    public params(variablesData: any): AxiosPromise<void> {
        const data = {
            query: query[this.queryData],
            variables: variablesData,
        };
        return service({
            method: 'post',
            url: '/graphql',
            data:  data,
            cancelToken: cancelToken()
        });
    }
}

export default new Graph();
