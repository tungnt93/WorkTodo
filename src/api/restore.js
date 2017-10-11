const restore = (link, userId) =>(
    fetch(link, {
        method: 'POST',
        headers:{
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({userId})})
            .then((response)=> response.json())
            .then((responseData)=>{
                console.log(responseData);
                return responseData.data.datas;
            })
);

module.exports = restore;

