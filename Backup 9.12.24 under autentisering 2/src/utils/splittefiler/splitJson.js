const fs = require('fs');

const rawData = fs.readFileSync('originaldata.JSON');
const data = JSON.parse(rawData);

const originalCsv = data["original csv"];
const itemsPerFile = Math.ceil(originalCsv.length / 10);

for (let i = 0; i < 10; i++) {
    const start = i * itemsPerFile;
    const end = start + itemsPerFile;
    const chunk = {
        "original csv": originalCsv.slice(start, end)
    };
    
    fs.writeFileSync(`species-data-${i + 1}.json`, JSON.stringify(chunk, null, 2));
}

console.log('JSON file has been split into 10 parts.');