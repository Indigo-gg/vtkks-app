import {post, postStream} from "@/api/request.js";



function getCode(data){
    return post('/get_code',data)
}

function getCodeStream(data,load){
    return postStream('/get_code',data,load)
}

export{getCode,getCodeStream}
