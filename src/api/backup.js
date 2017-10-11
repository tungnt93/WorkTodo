const backup = (data, link) =>(
    fetch(link, {
        method: 'POST',
        headers:{
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify(data)
    })
        .then(res=> res.text())
);

module.exports = backup;

