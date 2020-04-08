const server = require('./api/server');

const port = 5000;

server.listen(port, () => {
    console.log("\n === server is listening on port 5000 === \n")});