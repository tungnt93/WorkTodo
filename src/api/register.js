const register = (username, fullname, password) =>(
    fetch('http://kyucxua.net/api/worktodo/register', {
        method: 'POST',
        headers:{
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({username, fullname, password})
    })
        .then(res=> res.text())
);

module.exports = register;
