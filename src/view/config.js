//定义存储的消息结构

const MSG_LIST='app-msgList'

function SysMsgClass(content){

    return{
        id:Date.now(),
        role:'sys',
        time:'',
        content:content
    }
}

function UserMsgClass(content){

    return{
        id:Date.now(),
        role:'user',
        time:'',
        content:content
    }
}

export {SysMsgClass,UserMsgClass,MSG_LIST}



