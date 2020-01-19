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


export const endpointResponseTime =  {
  variable: ['$id: ID!', '$duration: Duration!'],
  fragment: `
  endpointResponseTime: getLinearIntValues(metric: {
    name: "endpoint_relation_server_resp_time"
    id: $id
  }, duration: $duration) {
    values {
      id
      value
    }
  }`,
};

export const endpointSLA =  {
  variable: ['$id: ID!', '$duration: Duration!'],
  fragment: `
  endpointSLA: getLinearIntValues(metric: {
    name: "endpoint_relation_server_call_sla"
    id: $id
  }, duration: $duration) {
    values {
      id
      value
    }
  }`,
};

