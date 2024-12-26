
const fs = require('fs');
const cheerio = require('cheerio');
const { Parser } = require('json2csv');

function isValidHardDriveValue(value) {
    const regex = /^[0-9]+(GB|TB)$/i;
    return regex.test(value);
}

// Hàm xóa 2 dấu cách thừa
const removeExtraSpaces = (str) => {
    return str.replace(/\s{2,}/g, ' ').trim();
}
// Đọc dữ liệu JSON
fs.readFile('./json/result_data_laptop.json', 'utf8', (err, data) => {
    if (err) {
        console.error('Lỗi khi đọc file JSON:', err);
        return;
    }
    let jsonData;
    try {
        jsonData = JSON.parse(data);
    } catch (parseErr) {
        console.error('Lỗi khi phân tích JSON:', parseErr);
        return;
    }
    // những dòng sản phẩm này thuộc gamming
    const seriesGaming = [
        'nitro', 'legion', 'tuf', 'rog', 'loq',
        'g5', 'alienware', 'acer', 'gf63', 'inspirion',
        'katana', 'creator', 'aspire', 'victus',
        'prestige', 'gaming', 'thin', 'inspiron',
        'g6', 'bravo', 'cyborg', 'msi', 'sword',
        'pulse', 'rog', 'g15', 'mf', 'fx506lh-hn002t', 'gp66'
    ]
    // mảng đẻ random xuât xứ và năm ra mắt và giá
    const xuatXu = ['Trung Quốc', 'Nhật Bản', 'Đài Loan', ' Hàn Quốc', 'Singapore']
    const ssdGB = ['128', '256', '512', '1024', '120', '320']
    const ssdbTB = ['1', '2', '4']
    const raMat = ['2021', '2022', '2023', '2024']
    const m = [18000000, 12000000, 19000000, 20000000, 14000000, 15000000, 25000000]
    const editJson = jsonData.map(d => {
        d.configs.need = {}
        d.configs.yearOfLaunch = {};
        d.configs.madeIn = {};
        // random năm sản xuất
        d.configs.yearOfLaunch.description = raMat[Math.floor(Math.random() * raMat.length)];
        // random xuất xứ
        d.configs.madeIn.description = xuatXu[Math.floor(Math.random() * xuatXu.length)];

        // Xóa bỏ giá trị trong hardDrive 
        d.configs.hardDrive.value = ''
        // bổ sung gb hoặc tb cho ổ cứng
        if (!isValidHardDriveValue(d?.configs?.hardDrive?.value)) {
            let flag = false;
            for (const value of ssdGB) {
                if (d?.configs?.hardDrive?.description.includes(value) && (d?.configs?.hardDrive?.description.toLowerCase().includes('ssd') || d?.configs?.hardDrive?.description.toLowerCase().includes('gb'))) {
                    if (value === '1024') {
                        d.configs.hardDrive.value = `1TB`
                    } else {
                        d.configs.hardDrive.value = `${value}GB`
                    }
                    flag = true;
                    break;
                }
            }
            if (!flag) {
                for (const value of ssdbTB) {
                    if (d?.configs?.hardDrive?.description.includes(value) && d?.configs?.hardDrive?.description.toLowerCase().includes('tb')) {
                        d.configs.hardDrive.value = `${value}TB`
                        break;
                    }
                }
            }
        }
        // nếu giá trị discountPrice = 0 hoặc null thì random giá trị
        if (d.discountPrice === 0 || d?.discountPrice == null) {
            d.discountPrice = m[Math.floor(Math.random() * m.length)]
        }
       // Tạo số ngẫu nhiên từ 0 đến 5 với 1 chữ số thập phân
        let rdRating = (Math.random() * 5).toFixed(1);
        if (rdRating < 1) {
            d.totalRating = 0
        } else {
            d.totalRating = rdRating
        }

        // Xóa 2 dấu cách trở lên trong title
        d.title = removeExtraSpaces(d.title);
        // Xử lý gán brand và series
        d.brand = d?.title.split(' ')[1].toLowerCase() || '';
        if (d?.title.toLowerCase().includes('surface')) {
            d.series = 'surface'
            d.brand = 'microsoft'
        } else if (!isNaN(Number(d?.title?.split(' ')[2])) && d?.title?.split(' ')[1] === 'HP') {
            d.series = 'hp'
        } else if (d?.title?.split(' ')[2] !== 'Gaming') {
            d.series = d?.title?.split(' ')[2].toLowerCase()
        }
        else {
            d.series = d?.title?.split(' ')[3].toLowerCase()
        }
        if (d?.title.toLowerCase().split(' ')[1] === 'gaming') {
            d.brand = d?.title.split(' ')[2].toLowerCase()
            d.series = d?.title.split(' ')[3].toLowerCase()
        }

        // Xử lý gán label cho sinh vieen và văn phòng
        if (d?.configs?.cpu?.description.toLowerCase().includes('i3')
            || (d?.discountPrice <= 20000000 && d.features[0].toLowerCase().includes('học tập'))
            || d?.configs?.cpu?.description.toLowerCase().includes('ryzen 3')
            || (d?.discountPrice <= 14000000 && d?.configs.ram.value === '8GB')
            || (d?.configs.hardDrive.value === '128GB')
            || d?.configs.ram.value === '4GB') {
            d.configs.need.description = 'Sinh viên'
        } else {
            d.configs.need.description = 'Văn phòng'
        }
        // Xử lý gán label cho gaming
        if (
            d?.title.toLowerCase().includes('gaming')
            || (d?.features[0].toLowerCase().includes('game')
                && d?.features[0].toLowerCase().includes('đồ hoạ')
                && (
                    d?.features[0].toLowerCase().includes('khủng')
                    || d?.features[0].toLowerCase().includes('nặng')
                    || d?.features[0].toLowerCase().includes('cao')
                    || d?.features[0].toLowerCase().includes('mượt mà')
                )
            )
            || d?.configs?.graphicCard?.description.toLowerCase().includes('gtx')
            || d?.configs?.graphicCard?.description.toLowerCase().includes('rtx')
            || (seriesGaming.includes(d?.series.toLowerCase() && (
                d?.configs?.graphicCard?.description.toLowerCase().includes('nvidia')
            )))
        ) {
            d.configs.need.description = 'Gaming'
        }

        return d
    }
    )
   
    const processedData = editJson.map(d => {
        //  bỏ các thẻ html
        const $ = cheerio.load(d?.features[0]);
        const textOnly = $('li').map((i, el) => $(el).text()).get().join(' ');
        // const textOnly = $.text();
        //
        return {
            label: d?.configs.need.description || '',
            title: d?.title || '',
            discountPrice: d?.discountPrice || 0,
            soldQuantity: d?.soldQuantity || 0,
            quantity: d?.quantity || 0,
            brand: d?.brand || '',
            series: d?.series || '',
            totalRating: d?.totalRating || 0,
            features: textOnly || '',
            color: d?.colors[0]?.color || '',
            'Năm ra mắt': d?.configs?.yearOfLaunch?.description.trim() || '',
            'Xuất xứ': d?.configs?.madeIn?.description.trim() || '',
            'Chip AI': d?.configs?.aiChip?.description.trim() || '',
            'Loại card đồ họa': d?.configs?.graphicCard?.description.trim() || '',
            'Loại CPU': d?.configs?.cpu?.description.trim() || '',
            'Dung lượng RAM': d?.configs?.ram?.value.trim() || '',
            'Loại RAM': d?.configs?.ram?.type?.trim() || '',
            'Mô tả ram': d?.configs?.ram?.description.trim() || '',
            'Ổ cứng': d?.configs?.hardDrive?.description.trim() || '',
            'Dung lượng ổ cứng': d?.configs?.hardDrive?.value.trim() || '',
            'Tần số quét': d?.configs?.refreshRate?.description.trim() || '',
            'Chất liệu tấm nền': d?.configs?.panel?.description.trim() || '',
            'Kích thước màn hình': d?.configs?.screen?.description.trim() || '',
            'Công nghệ màn hình': d?.configs?.screenTechnology?.description.trim() || '',
            'Độ phân giải màn hình': d?.configs?.resolution?.description.trim() || '',
            'Công nghệ âm thanh': d?.configs?.audioTechnology?.description.trim() || '',
            'Chất liệu': d?.configs?.material?.description.trim() || '',
            'Kích thước': d?.configs?.size?.description.trim() || '',
            'Trọng lượng': d?.configs?.weight?.description.trim() || '',
            'Tính năng đặc biệt': d?.configs?.specialFeature?.description.trim() || '',
            'Loại đèn bàn phím': d?.configs?.keyboardLight?.description.trim() || '',
            'Bảo mật': d?.configs?.security?.description.trim() || '',
            'Webcam': d?.configs?.webcam?.description.trim() || '',
            'Hệ điều hành': d?.configs?.operatingSystem?.description.trim() || '',
            'Pin': d?.configs?.battery?.description.trim() || '',
            'Wi-Fi': d?.configs?.wifi?.description.trim() || '',
            'Bluetooth': d?.configs?.bluetooth?.description.trim() || '',
            'Cổng giao tiếp': d?.configs?.connectionPort?.description.trim() || '',
        }
    });

    const fields = [
        'label',
        'title', 'discountPrice',
        'soldQuantity',
        'quantity', 'brand', 'series',
        'totalRating',
        'features', 'color',
        'Năm ra mắt',
        'Xuất xứ',
        'Loại card đồ họa',
        'Loại CPU',
        'Dung lượng RAM',
        'Loại RAM',
        'Mô tả ram',
        'Ổ cứng',
        'Dung lượng ổ cứng',
        'Tần số quét',
        'Chất liệu tấm nền',
        'Kích thước màn hình',
        'Công nghệ màn hình',
        'Độ phân giải màn hình',
        'Công nghệ âm thanh',
        'Chất liệu',
        'Kích thước',
        'Trọng lượng',
        'Tính năng đặc biệt',
        'Loại đèn bàn phím',
        'Bảo mật',
        'Webcam',
        'Hệ điều hành',
        'Pin',
        'Wi-Fi',
        'Bluetooth',
        'Cổng giao tiếp',
    ];

    const opts = { fields };

    try {
        const parser = new Parser(opts);
        let csv = parser.parse(processedData);

        // Thêm BOM vào đầu file để hỗ trợ hiển thị tiếng Việt đúng trong Excel
        csv = '\uFEFF' + csv;

        fs.writeFile('./csv/data_laptop.csv', csv, 'utf8', (writeErr) => {
            if (writeErr) {
                console.error('Lỗi khi ghi file CSV:', writeErr);
                return;
            }
            console.log('Đã chuyển đổi thành công từ JSON sang CSV.');
        });
    } catch (err) {
        console.error('Lỗi khi chuyển đổi JSON sang CSV:', err);
    }

    // Ghi dữ liệu đã xử lý vào file JSON mới
    fs.writeFile('./json/modified_data_big.json', JSON.stringify(editJson), 'utf8', (writeErr) => {
        if (writeErr) {
            console.error('Lỗi khi ghi file JSON:', writeErr);
            return;
        }
        console.log('Đã cập nhật và lưu file JSON thành công vào modified_Lap.json.');
    });
});