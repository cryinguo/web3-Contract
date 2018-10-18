const readline = require('readline');
const fs = require('fs');

const rl = readline.createInterface({
    input: fs.createReadStream('./CPB.sol')
});

let count = 0;
rl.on('line', (line) => {  
    if (line.length !== 0) {
        if (line.indexOf('/') === -1 && line.indexOf('*') === -1) {
            count += 1;
        }
    }
    console.log(count);
});
