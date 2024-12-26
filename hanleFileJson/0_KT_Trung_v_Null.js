let newData = require('./dataJs/laptopData')
const fs = require('fs');


newData = newData.filter(Boolean)

const seenSlugs = new Set();
const uniqueData = newData.filter(item => {
    if (seenSlugs.has(item.slug)) {
        return false;
    } else {
        seenSlugs.add(item.slug);
        return true;
    }
});

fs.writeFile('./dataJs/result_data_laptop.json', JSON.stringify(uniqueData), (err) => {
    if (err) {
        console.log('Lỗi khi ghi file result_data_laptop.json', err);
        throw err;
    };
    console.log('Đã lưu file data.json');
});



