const fs = require('fs');
const cheerio = require('cheerio');
const { Parser } = require('json2csv');


fs.readFile('./json/modified_data_big.json', 'utf8', (err, data) => {
    if (err) {
        console.error('Lỗi khi đọc file JSON:', err);
        return;
    }
    let jsonData;
    try {
        jsonData = JSON.parse(data);
        // console.log(jsonData)
    } catch (parseErr) {
        console.error('Lỗi khi phân tích JSON:', parseErr);
        return;
    }
    const processedData = jsonData.map(d => {
        const $ = cheerio.load(d?.features[0]);
        const textOnly = $('li').map((i, el) => $(el).text()).get().join(' ');
        // const textOnly = $.text();
        //
        return {
            label: d?.configs?.need?.description || '',
            title: d?.title || '',
            discountPrice: d?.discountPrice || 0,
            soldQuantity: d?.soldQuantity || 0,
            quantity: d?.quantity || 0,
            brand: d?.brand || '',
            series: d?.series || '',
            totalRating: d?.totalRating || 0,
            features: textOnly || '',
            slug: d?.slug || '',
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
        'slug',
        'title',
        'discountPrice',
        'soldQuantity',
        'quantity',
        'brand',
        'series',
        'totalRating',
        'features',
        'color',
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
});