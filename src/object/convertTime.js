import moment from 'moment';

const convertTime = (time, type) =>{
    let now = moment().format("YYYYMMDD");
    let cvTime =  moment.unix(time).format("YYYYMMDD");
    console.log(cvTime + 1);
    if(now === cvTime){
        if(type === 1)
            return moment.unix(time).format("HH:mm") + ' Hôm nay';
        else
            return moment.unix(time).format("HH:mm");
    }
    else if(now === cvTime + 1){
        if(type === 1)
            return moment.unix(time).format("HH:mm") + ' Hôm qua';
        else
            return 'Hôm qua';
    }
    else{
        let nowYear = moment().format("YYYY");
        let timeYear = moment.unix(time).format("YYYY");
        if(nowYear === timeYear){
            if(type === 1)
                return moment.unix(time).format("HH:mm DD/MM");
            else
                return moment.unix(time).format("DD/MM");
        }
        else
            if(type === 1)
                return moment.unix(time).format("HH:mm DD/MM/YYYY");
            else
                return moment.unix(time).format("DD/MM/YYYY");
    }
    // return moment.unix(time).format("DD/MM/YYYY");
}

module.exports = convertTime;