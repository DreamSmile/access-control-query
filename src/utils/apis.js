import { $post, $get } from './https'
let nowEnviroment = process.env.NODE_ENV;
let api;
api = nowEnviroment == "development" ? "/api" : "http://tm.lilanz.com/oa/project/facepass/pushmessage.ashx?servername=svr-build/att&action=LoadHikList"

let wxApi;
wxApi = nowEnviroment == "development" ? "/wxApi" : "http://tm.lilanz.com/oa/api/WxAuthForLilanz.ashx"

// 根据token获得用户信息
export function getUserInfoByToken(data) {
    return $get(wxApi, data)
}
// 获取门禁列表
export function getList(datas) {
    console.log(datas)
    return $post(api, datas)
}