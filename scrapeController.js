const { fetchUrlProduct, fetchUrlProductCellPhone } = require('./api');
const scrapes = require('./scraper');
const fs = require('fs');
// const scrapeController = async (browerInstance) =>{
//     //const url = 'https://phongvu.vn/laptop-lenovo-loq-15iax9-83gs001qvn-i5-12450hx-xam--s240806082';
//     try {
//         let browser =await browerInstance
//         const urls = await fetchUrlProduct({slug: "/c/laptop"});
//         const data = [];
//         const logs = [];
//         for(let url of urls){
//             let {data:d,log} = await scrapes.scraper(browser,'https://phongvu.vn/'+url);
//             data.push(d);
//             if(log){
//                 logs.push(log);
//             }
//         }
//         fs.writeFile('laptopData.json',JSON.stringify(data),(err)=>{
//             if(err) {
//                 console.log('Lỗi khi ghi file laptopData.json', err);
//                 throw err;
//             };
//             console.log('Đã lưu file data.json');
//         });
//         fs.writeFile('logs.json',JSON.stringify(logs),(err)=>{
//             if(err) {
//                 console.log('Lỗi khi ghi file logs.json', err);
//                 throw err;
//             };
//             console.log('Đã lưu file logs.json');
//         });
//         // các category còn lại thì có thể coppy và cho chạy or nếu khác thì viết hàm để chạy lại
//     } catch (error) {
//         console.log('Lỗi ở scrapeController', error);
//     }
// }
const scrapeController = async (browerInstance) =>{
    //const url = 'https://phongvu.vn/laptop-lenovo-loq-15iax9-83gs001qvn-i5-12450hx-xam--s240806082';
    try {
        let browser =await browerInstance
        let urls = [];
        //
        for(let i = 62; i<=80; i++){
            let d = await fetchUrlProductCellPhone({page: i});
            urls = urls.concat(d);
        }
        const data = [];
        const logs = [];
        // urls = urls.slice(0,4);
        let idx = 0;
        for(let url of urls){
            idx++;
            let {data:d,log} = await scrapes.scraperCellPhone(browser,'https://cellphones.com.vn/'+url);
            data.push(d);
            if(log){
                logs.push({log:log, idx_link_web:idx});
            }
        }
        fs.writeFile('laptopData.json',JSON.stringify(data),(err)=>{
            if(err) {
                console.log('Lỗi khi ghi file laptopData.json', err);
                throw err;
            };
            console.log('Đã lưu file data.json');
        });
        fs.writeFile('logs.json',JSON.stringify(logs),(err)=>{
            if(err) {
                console.log('Lỗi khi ghi file logs.json', err);
                throw err;
            };
            console.log('Đã lưu file logs.json');
        });
        // các category còn lại thì có thể coppy và cho chạy or nếu khác thì viết hàm để chạy lại
    } catch (error) {
        console.log('Lỗi ở scrapeController', error);
    }
}
module.exports = scrapeController;