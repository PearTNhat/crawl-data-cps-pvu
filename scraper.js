
const scraper = async (brower, url) => {
    try {
        let data = {}
        let log
        const page = await brower.newPage();
        console.log('>> Mở trang web');
        await page.goto(url);
        console.log('>> Đi tới url', url);
        const tag = "#__next"
        await page.waitForSelector(tag);
        const urlParts = url.split('/');
        let slug = urlParts[urlParts.length - 1];
        // lấy ra thẻ header 
        let headerData = await page.$eval('div.css-rf24tk > div > div:nth-child(2) > div.css-1hwtax5', (el) => {
            const soldQuantity = Math.floor(Math.random() * 100);
            const quantity = Math.floor(Math.random() * 40);
            const images = []
            const imgs = el.querySelectorAll('div.css-1i1dodm > div:nth-child(1) > div.css-12isv00 img');
            for (let img of imgs) {
                images.push({ url: img.src });
            }
            return {
                title: el.querySelector('div.css-6b3ezu > div:nth-child(1) > h1').textContent,
                description: el.querySelector('div.css-1i1dodm > div.css-1nv5d5l').innerHTML,
                discountPrice: el.querySelector('div.css-2zf5gn > div.att-product-detail-latest-price.css-roachw')?.textContent,
                price: el.querySelector('div.css-3mjppt > div.att-product-detail-retail-price.css-18z00w6')?.textContent || 0,
                soldQuantity,
                quantity,
                category: 'laptop',
                brand: el.querySelector('div.css-6b3ezu > div:nth-child(1) > div > div > a > span').textContent,
                totalRating: 0,
                primaryImage: images[0],
                colors: {
                    primaryImage: images[1],
                    images: images,
                    soldQuantity,
                    quantity,
                }
            }
        })
        headerData.slug = slug;
        await page.evaluate(() => {
            const lazyComponent = document.querySelector('.lazy-component');
            if (lazyComponent) {
                lazyComponent.scrollIntoView();
            }
        });
        await page.evaluate(() => {
            window.scrollTo(0, 1000);
        });
        let color
        try {
            await page.waitForSelector('div.teko-col.teko-col-4.css-17ajfcv > div:nth-child(3) > div.css-1alns4t');
            await page.click('div.teko-col.teko-col-4.css-17ajfcv > div:nth-child(3) > div.css-1alns4t');
            color = await page.$eval('div.css-1ilwpbr > div.css-9s7q9u > div:nth-last-child(3) > div:nth-child(2)', (el) => {
                return el.textContent
            })
        } catch (error) {
            console.log(error.message);
            log = {
                error: error.message,
                url: url
            }
        }
        headerData.colors.color = color;
        data = headerData;
        await page.close();
        return { data, log };
    } catch (error) {
        console.log('Lỗi ở scraper', error);
        //  throw new Error (error);
    }
}
const wait = (milliseconds) => {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
};
function convertPriceStringToNumber(priceStr) {
    // Loại bỏ dấu chấm, dấu phẩy và các ký tự không phải số
    if (!priceStr) return 0;
    return Number(priceStr?.replace(/[^0-9]/g, '')) || 0;
}

const scraperCellPhone = async (brower, url) => {
    try {
        let data = {}
        let log
        const page = await brower.newPage();
        console.log('>> Mở trang web');
        try {
            await page.goto(url);
            console.log('>> Đi tới url', url);
            const tag = ".cps-container.cps-body"
            await page.waitForSelector(tag);
        } catch (error) {
            console.error(`Không tìm thấy selector .cps-container.cps-body trên URL: ${url}`);
            await page.close();
            return { data: null, log: `Selector không tồn tại trên URL: ${url}` };
        }
        await page.waitForSelector("#breadcrumbs");
        const urlParts = url.split('/');
        let slug = urlParts[urlParts.length - 1].split('.')[0];
        // lấy ra thẻ header 
        await page.evaluate(() => {
            window.scrollTo(0, 500);
        });
        let headerData
        try {
            headerData = await page.$eval('#productDetailV2', (el) => {
                const soldQuantity = Math.floor(Math.random() * 100);
                const quantity = Math.floor(Math.random() * 100);
                const images = []
                const imgs = el.querySelectorAll('.gallery-slide.gallery-top.swiper-container.swiper-container-initialized.swiper-container-horizontal > .swiper-wrapper > .swiper-slide');
                const pImage = el.querySelector('#v2Gallery > div > img');
                for (let img of imgs) {
                    const cImg = img.querySelector('img');
                    if (cImg) {
                        images.push({ url: cImg.src });
                    }
                }
                return {
                    title: el.querySelector('#productDetailV2 > section > div.box-header.is-flex.is-align-items-center.box-header-desktop > div.box-product-name > h1')?.textContent.trim(),
                    description: [el.querySelector('#cpsContentSEO').innerHTML],
                    features: [el.querySelector('#v2Gallery > div > div:nth-child(2) > div.desktop').innerHTML],
                    discountPrice: el.querySelector('#trade-price-tabs > div > div > div.tpt-box.has-text-centered.is-flex.is-flex-direction-column.is-flex-wrap-wrap.is-justify-content-center.is-align-items-center.active > p.tpt---sale-price')?.textContent,
                    price: el.querySelector('#trade-price-tabs > div > div > div.tpt-box.has-text-centered.is-flex.is-flex-direction-column.is-flex-wrap-wrap.is-justify-content-center.is-align-items-center.active > p.tpt---price')?.textContent || 0,
                    soldQuantity,
                    quantity,
                    brand: el.querySelector('#breadcrumbs > div.block-breadcrumbs.affix > div > ul > li:nth-child(3) > a')?.textContent.toLowerCase().trim(),
                    series: el.querySelector('#breadcrumbs > div.block-breadcrumbs.affix > div > ul > li:nth-child(4) > a')?.textContent.toLowerCase().trim(),
                    totalRating: 0,
                    primaryImage: {
                        url: pImage.src
                    },
                    colors: [
                        {
                            color: el.querySelector('#productDetailV2 > section > div.box-detail-product.columns.m-0 > div.box-detail-product__box-center.column > div.box-product-variants > div.box-content > ul > li > a > div > strong').textContent,
                            primaryImage: images[1],
                            images: images,
                            soldQuantity,
                            quantity,
                        }
                    ]

                }
            })

            headerData.slug = slug;
            headerData.price = convertPriceStringToNumber(headerData.price) || 0;
            headerData.discountPrice = convertPriceStringToNumber(headerData.discountPrice) || 0;
        } catch (error) {
            console.log(error.message);
            log = {
                error: error.message,
                slug: slug
            }
        }
        await page.evaluate(() => {
            const lazyComponent = document.querySelector('#cpsContent');
            if (lazyComponent) {
                lazyComponent.scrollIntoView();
                window.scrollBy(0, -100);
            }
        });
        await wait(1000);
        await page.waitForSelector('.block-content-product-right');
        try {
            await page.click('#productDetailV2 > section > div.block-content-product > div.block-content-product-right > div > div > button');
            await wait(1000);
            const modal = '#productDetailV2 > section > div.block-content-product > div.block-content-product-right > div > div > div.modal.is-active > div.modal-card > section'
            await page.waitForSelector(`${modal}`);
            //   throw new Error('Lỗi không click được');

            const configs = await page.$$eval(`${modal} .px-3.py-2.is-flex.is-align-items-center.is-justify-content-space-between`, (els) => {
                let config = {}
                '#productDetailV2 > section > div.block-content-product > div.block-content-product-right > div > div > div.modal.is-active > div.modal-card > section > div > ul > li:nth-child(3) > div > div:nth-child(1)'
                els.forEach((el) => {
                    let p = el.querySelector('p');
                    if (p.querySelector('a')) {
                        p = p.querySelector('a').textContent;
                    }
                    else {
                        p = p.textContent;
                    }
                    const value = el.querySelector('div').textContent;
                    let obj = {}
                    if (p === 'Loại card đồ họa') {
                        obj.description = value
                        config.graphicCard = obj;
                    }
                    if (p === 'Loại CPU') {
                        obj.description = value
                        config.cpu = obj;
                    }
                    if (p === 'Dung lượng RAM' || p === 'Loại RAM' || p === 'Số khe ram') {
                        if (p === 'Dung lượng RAM') {
                            obj.description = value + ' ';
                            obj.value = value;
                            config.ram = obj;
                        }
                        if (p === 'Loại RAM') {
                            config.ram.type = value;
                            config.ram.description += value + ' ';
                        }
                        if (p === 'Số khe ram') {
                            config.ram.description += value + ' ';
                        }
                    }
                    if (p === 'Ổ cứng') {
                        obj.description = value;
                        obj.value = value.split(' ')[0].trim();
                        config.hardDrive = obj;
                    }
                    if (p === 'Tần số quét') {
                        obj.description = value;
                        config.refreshRate = obj;
                    }
                    //
                    if (p === "Công nghệ âm thanh") {
                        obj.description = value;
                        config.audioTechnology = obj;
                    }
                    if (p === "Cổng giao tiếp") {
                        obj.description = value;
                        config.connectionPort = obj;
                    }
                    if (p === "Chất liệu") {
                        obj.description = value;
                        config.material = obj;
                    }
                    if (p === "Bluetooth") {
                        obj.description = value;
                        config.bluetooth = obj;
                    }
                    if (p === "Hệ điều hành") {
                        obj.description = value;
                        config.operatingSystem = obj;
                    }
                    if (p === "Kích thước màn hình") {
                        obj.description = value;
                        config.screen = obj;
                    }
                    if (p === "Kích thước") {
                        obj.description = value;
                        config.size = obj;
                    }
                    if (p === "Độ phân giải màn hình") {
                        obj.description = value;
                        config.resolution = obj;
                    }
                    if (p === "Trọng lượng") {
                        obj.description = value;
                        config.weight = obj;
                    }
                    if (p === "Pin") {
                        obj.description = value;
                        config.battery = obj;
                    }
                    //
                    if (p === "Chất liệu tấm nền") {
                        obj.description = value;
                        config.panel = obj;
                    }
                    if (p === "Công nghệ màn hình") {
                        obj.description = value;
                        config.screenTechnology = obj;
                    }
                    if (p === "Khe đọc thẻ nhớ") {
                        obj.description = value;
                        config.cardReader = obj;
                    }
                    if (p === "Wi-Fi") {
                        obj.description = value;
                        config.wifi = obj;
                    }
                    if (p === "Chip AI") {
                        obj.description = value;
                        config.aiChip = obj;
                    }
                    if (p === "Bảo mật") {
                        obj.description = value;
                        config.security = obj;
                    }
                    if (p === "Loại đèn bàn phím") {
                        obj.description = value;
                        config.keyboardLight = obj;
                    }
                    if (p === "Tính năng đặc biệt") {
                        obj.description = value;
                        config.specialFeature = obj;
                    }
                    if (p === "Webcam") {
                        obj.description = value;
                        config.webcam = obj;
                    }
                })
                return config;
            })
            headerData.configs = configs;

        } catch (error) {
            console.log(error.message);
            log = {
                error: error.message,
                slug: slug
            }
        }
        //   headerData.colors.color = color;
        data = headerData;
        await page.close();
        return { data, log };
    } catch (error) {
        console.log('Lỗi ở scraper', error);
        //  throw new Error (error);
    }
}
module.exports = {
    scraper,
    scraperCellPhone
}