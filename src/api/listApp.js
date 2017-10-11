const listApp = () =>(
    fetch('http://kyucxua.net/api/worktodo/listApp')
        .then((response)=> response.json())
        .then((responseData)=>{
            return responseData.data.apps;
        })
);

module.exports = listApp;

