
const http = require('http');

const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/dashboard/jobs/1',
    method: 'GET'
};

const req = http.request(options, res => {
    console.log(`STATUS: ${res.statusCode}`);
});

req.on('error', error => {
    console.error(error);
});

req.end();
