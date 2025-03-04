import {post,get, postStream} from "@/api/request.js";



function getCode(data){
    return post('/get_code',data)
}

function getCodeStream(data,load){
    return postStream('/get_code',data,load)
}
function getEvalResultStream(data,callback){
    return postStream('/evaluate',data,callback)
}
function getCaseList(data){
    return post('/get_case_list',data)
}
// function getACaseCode(path){
//     return get(path)
// }
function generateCodeStream(data,callback){
    return postStream('/generateStream',data,callback)
}

/**
 *
 * @param data
 * @returns {options}
 */
function generateCode(data){
    return post('/generate',data)
}

/**
 *
 * @param data
 * @returns {options}
 */
function getEvalResult(data){
    return post('/evaluate',data)
}
function getAllCase(){
    return get('/get_all_data',{})
}
export{
    getCode,
    getCodeStream,
    getEvalResult,
    getCaseList,
    getEvalResultStream,
    generateCodeStream,
    getAllCase,
    generateCode

}
