
import { createStore, combineReducers, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
// import SqlService from '../providers/SqlService';
// import moment from 'moment';

// const arr_theme = [['#0080FD', '#0F387D'],['#01a4a4','#009393'], ['#00a1cb', '#0090B6'],
//                 ['#61AE24', '#579C20'], ['#D0D102', '#BABB01'], ['#32742C', '#2C6827'],
//                 ['#E54028', '#CD3923'], ['#F18D05', '#D87E04'], ['#616161', '#575757']];

const saveUser = (state = null, action) =>{
    if(action.type === 'SAVE_USER'){
        console.log(action.user);
        return action.user;
    }
    return state;
};

const listWorkToday = (state = [], action)=>{
    if(action.type === 'LIST_WORK_TODAY'){
        console.log('get list work today');
        console.log(action.list);
        return action.list;
    }
    return state;
};
const listWorkDoing = (state = [], action)=>{
    if(action.type === 'LIST_WORK_DOING'){
        console.log('get list work doing');
        return action.list;
    }
    return state;
};

const listWorkRedux = (state = [], action)=>{
    if(action.type === 'LIST_WORK'){
        console.log('get list work');
        return action.list;
    }
    return state;
};

const listWorkDone = (state = [], action)=>{
    if(action.type === 'LIST_WORK_DONE'){
        console.log('get list work done');
        return action.list;
    }
    return state;
};

const listWorkMiss = (state = [], action)=>{
    if(action.type === 'LIST_WORK_MISS'){
        console.log('get list work miss');
        return action.list;
    }
    return state;
};

const listWorkByDay = (state = [], action) =>{
    if(action.type === 'LIST_WORK_BY_DAY'){
        console.log('get list work by day');
        return action.list;
    }
    return state;
};

// const loadMoreWork = (state = [], action)=>{
//     if(action.type === 'LOAD_MORE'){
//         console.log('type: '+ action.typeLoad);
//         if(action.typeLoad === 1){
//
//         }
//         else if(action.typeLoad === 2){
//
//         }
//         else{
//
//         }
//     }
//     return state;
// };

const listNote = (state = [], action)=>{
    if(action.type === 'LIST_NOTE'){
        return action.list;
    }
    return state;
};

const lastSync = (state = 0, action) =>{
    if(action.type === 'LAST_SYNC'){
        return action.time;
    }
    return state;
}

const lastRestore = (state = 0, action) =>{
    if(action.type === 'LAST_RESTORE'){
        return action.time;
    }
    return state;
}

// const theme = (state = arr_theme[0], action) =>{
//     if(action.type === 'SET_THEME'){
//         return arr_theme[action.pos];
//     }
//     return state;
// }

const reducer = combineReducers({
    listWorkToday: listWorkToday,
    listWorkDoing: listWorkDoing,
    listWorkRedux: listWorkRedux,
    listWorkDone: listWorkDone,
    listWorkMiss: listWorkMiss,
    // loadMoreWork: loadMoreWork,
    listNote: listNote,
    listWorkByDay: listWorkByDay,
    user: saveUser,
    lastSync: lastSync,
    lastRestore: lastRestore,
    // theme: theme
});

const store = createStore(reducer, applyMiddleware(thunk));

export default store;