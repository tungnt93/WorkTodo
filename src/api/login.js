const login = (username, password) =>(
    fetch('http://kyucxua.net/api/worktodo/login', {
        method: 'POST',
        headers:{
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({username, password})
    })
        .then(res=> res.text())
);

module.exports = login;

