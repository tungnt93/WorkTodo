const feedback = (email, content) =>(
    fetch('http://kyucxua.net/api/worktodo/feedback', {
        method: 'POST',
        headers:{
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({email, content})
    })
        .then(res=> res.text())
);

module.exports = feedback;
