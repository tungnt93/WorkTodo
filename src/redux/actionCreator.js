import SqlService from '../providers/SqlService';
import moment from 'moment';

let pageWork = 1;
let pageWorkDone = 1;
let pageWorkMiss = 1;
let pageNote = 1;
let per_page = 6;

function actionGetListWorkToday(_list) {
    return {
        type: 'LIST_WORK_TODAY',
        list: _list
    }
}
export  function getListWorkToday() {
    return dispatch => {
        let today = moment().format("YYYYMMDD");
        SqlService.select('work', '*', 'isDelete = 0 AND startDate <= ' + today + ' AND endDate >= ' + today, null, 'startUnix ASC', null).then(res => {
            console.log('dispatch today');
            dispatch(actionGetListWorkToday(res));
        });
    }
}

function actionGetListWork(_list) {
    return {
        type: 'LIST_WORK',
        list: _list
    }
}
export  function getListWork() {
    return dispatch => {
        let today = moment().format("YYYYMMDD");
        SqlService.select('work', '*', 'isDelete = 0 AND startDate > ' + today, null, 'startUnix ASC', [0, pageWork*per_page]).then(res => {
            console.log('dispatch list');
            dispatch(actionGetListWork(res));
        });
    }
}

function actionGetListWorkDoing(_list) {
    return {
        type: 'LIST_WORK_DOING',
        list: _list
    }
}
export  function getListWorkDoing() {
    return dispatch => {
        let currentUnix = moment().unix();
        SqlService.select('work', '*', 'isDelete = 0 AND status = 4 AND startUnix <= ' + currentUnix + ' AND endUnix >= ' + currentUnix, null, null, null).then(res => {
            console.log('dispatch doing');
            dispatch(actionGetListWorkDoing(res));
        });
    }
}

function actionGetListWorkDone(_list) {
    return {
        type: 'LIST_WORK_DONE',
        list: _list
    }
}

export  function getListWorkDone() {
    return dispatch => {
        SqlService.select('work', '*', 'isDelete = 0 AND status = 3', null, 'endUnix DESC', [0, pageWorkDone*per_page]).then(res => {
            console.log('dispatch done');
            dispatch(actionGetListWorkDone(res));
        });
    }
}

function actionGetListWorkMiss(_list) {
    return {
        type: 'LIST_WORK_MISS',
        list: _list
    }
}

export  function getListWorkMiss() {
    return dispatch => {
        let currentUnix = moment().unix();
        let today = moment().format("YYYYMMDD");
        SqlService.select('work', '*', 'isDelete = 0 AND status = 4 AND endDate < ' + today + '   AND endUnix < ' + currentUnix, null, 'startUnix ASC', [0, pageWorkMiss*per_page]).then(res => {
            console.log('dispatch miss');
            dispatch(actionGetListWorkMiss(res));
        });
    }
}

function actionGetListWorkByDay(_list) {
    return {
        type: 'LIST_WORK_BY_DAY',
        list: _list
    }
}

export  function getListWorkByDay(date) {
    return dispatch => {
        SqlService.select('work', '*', 'isDelete = 0 AND startDate <= ' + date + ' AND endDate >= ' + date, null, 'startUnix ASC', null).then(res => {
            console.log('dispatch list work by day');
            dispatch(actionGetListWorkByDay(res));
        });
    }
}

export function loadMore(type) {
    console.log('load more type: ' + type);
    if(type === 1){
        pageWorkMiss++;
        return getListWorkMiss();
    }
    else if(type === 2){
        pageWork++;
        return getListWork();
    }
    else if(type === 3){
        pageWorkDone++;
        return getListWorkDone();
    }
    else if(type === 6){
        pageNote++;
        return getListNote();
    }
}

function actionGetListNote(_list) {
    return {
        type: 'LIST_NOTE',
        list: _list
    }
}

export  function getListNote() {
    return dispatch => {
        SqlService.select('note', '*', 'isDelete = 0', null, 'lastEdit DESC', [0, pageNote*per_page]).then(res => {
            console.log('dispatch miss');
            dispatch(actionGetListNote(res));
        });
    }
}

export function saveUser(_user) {
    return {
        type: 'SAVE_USER',
        user: _user
    }
}

export function setLastSync(_time) {
    return {
        type: 'LAST_SYNC',
        time: _time
    }
}

export function setLastRestore(_time) {
    return {
        type: 'LAST_RESTORE',
        time: _time
    }
}