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

import Vue from 'vue';
import Router from 'vue-router';
// import Login from './views/containers/login.vue';
import Index from './views/containers/index.vue';
import Dashboard from './views/containers/dashboard.vue';
import Trace from './views/containers/trace.vue';
import Topology from './views/containers/topology.vue';
import Alarm from './views/containers/alarm.vue';
import Comparison from './views/containers/comparison.vue';
import CallerAnalysis from './views/containers/callerAnalysis.vue'
import dependencyAnalysis from './views/containers/dependencyAnalysis.vue'
import auth from '@/utils/auth';

Vue.use(Router);
window.axiosCancel = [];

const router = new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  isGoNext: false,
  linkActiveClass: 'active',
  routes: [
    // {
    //   path: '/login',
    //   component: Login,
    //   meta: { login: true },
    // },
    {
      path: '/',
      component: Index,
      children: [
        {
          path: '',
          component: Dashboard,
        },
        {
          path: 'calleranalysis',
          component: CallerAnalysis
        },
        {
          path: 'dependencyanalysis',
          component: dependencyAnalysis
        },
        {
          path: 'trace',
          component: Trace,
        },
        {
          path: 'topology',
          component: Topology,
        },
        {
          path: 'alarm',
          component: Alarm,
        },
        {
          path: 'comparison',
          component: Comparison,
        },
      ],
    },
  ],
});

router.beforeEach((to, from, next) => {
    window.onmessage = (event: any) => {
        if (event.source !== window.parent) {
            return;
        } else {
            auth.saveToken(event.data);
            router.isGoNext = true;
            next()
        }
    };
    if(router.isGoNext){
        next()
    }
  if (window.axiosCancel.length !== 0) {
    for (const func of  window.axiosCancel) {
      setTimeout(func(), 0);
    }
    window.axiosCancel = [];
  }
  // if (to.meta.login && (token === null || token === 'guest')) {
  //   next();
  // } else if (token === null || token === 'guest') {
  //   next('/login');
  // } else if (to.meta.login) {
  //   next(from.path);
  // } else {
  //   next();
  // }
  next();
});

export default router;
