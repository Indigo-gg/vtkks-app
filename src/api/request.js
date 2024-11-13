import axios from 'axios';
const baseURL='http://127.0.0.1:5000'
// 创建axios实例
const service = axios.create({
    baseURL: baseURL, // 设置统一的请求前缀
    timeout: 60000 // 设置统一的超时时长
});

// POST请求封装
function post(url, data) {
    return service({
        url: url,
        method: 'post',
        data: data
    });
}
function postStream(url,data,load) {
    return service({
        url: url,
        method: 'post',
        data:data,
        responseType: 'stream',
        onDownloadProgress:load
    })
}
export {post,postStream}
