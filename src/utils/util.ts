import Vue from 'vue';
import service from './config-service';

/**
 * 验证IP地址
 */
export function isValidIP(ip: string) {
  const reg = /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5]|\*)\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5]|\*)\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5]|\*)$/;
  return reg.test(ip);
}

/**
 * 对象深拷贝
 * c为目标对象，p为源对象
 */
export function deepCopy(c: any, p: any) {
  c = c || {};
  for (const i in p) {
    if (typeof p[i] === 'object' && p[i] != null) {
      c[i] = (Object.prototype.toString.call(p[i]) === '[object Array]') ? [] : {};
      deepCopy(c[i], p[i]);
    } else {
      c[i] = p[i];
    }
  }
  return c;
}


/**
 * 失败提示
 */
export function errEvent(str: string) {
    Vue.prototype.$noty.error(str, {timeout: 500});
}
/**
 * 成功提示
 */
export function successEvent(str: string) {
    Vue.prototype.$noty.success(str, {timeout: 500});
}

/**
 * 异步请求方法
 * param：传递的参数，类型为object
 * method: 传递的方法类型，默认为post
 * showErr: 是否显示错误提示框，默认显示
 * showSuc：是否显示成功提示框，默认不显示
 */

export function asyncHandler(param: any, successCallback: any, failCallback: any) {
    const showErr = param.showErr !== undefined ? param.showErr : true;
    const showSuc = param.showSuc !== undefined ? param.showSuc : false;
    let promise;
    if (param.method && param.method === 'post') {
        promise = service({
            method: 'post',
            url: param.url,
            data:  param.params,
        });
    } else {
        promise = service({
            method: 'get',
            url: param.url,
            params: param.params,
        });
    }
    promise.then((response: any) => {
        if (showSuc) successEvent(response.data.message);
        if (successCallback) successCallback(response);
    }).catch((error: any) => {
        if (showErr) errEvent(error.message);
        if (failCallback) failCallback(error);
    });
}

/**
 * 日期格式化为2018/01/15
 */
function add0(m: any) {
    return m < 10 ? '0' + m : m;
}
export function dateFormat(seconds: any) {
  const time = new Date(seconds);
  const y = time.getFullYear();
  const m = time.getMonth() + 1;
  const d = time.getDate();
  const h = time.getHours();
  const mm = time.getMinutes();
  const s = time.getSeconds();
  return y + '/' + add0(m) + '/' + add0(d) + ' ' + add0(h) + ':' + add0(mm) + ':' + add0(s);
}

