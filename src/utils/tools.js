import { Dialog, Toast } from 'vant';

export function showDialog(msg, title = '提 示', opts = {}) {
    Object.assign(opts, {
        message: msg,
        title: title
    });
    return Dialog.alert(opts);
}
export function showToast(msg, opts = {}) {
    let obj = {
        duration: 0,
        forbidClick: true,
        overlay: false,
        message: msg
    };
    Object.assign(obj, opts);
    Toast(obj);
}
// 判断缓存中数据有没有过期,没有过期返回true
export function overdue() {
    let old = localStorage.getItem("VISA_TIME");
  //2592000000为3天时间
    return new Date().getTime() - old < 2592000000
}