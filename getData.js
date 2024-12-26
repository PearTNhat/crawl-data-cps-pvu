const { default: axios } = require("axios")
const fs = require('fs');
const { fetchUrlProductCellPhone } = require("./api");
function capitalizeFirstCharacter(str) {
    if (!str) return str; // Handle empty or null strings
    return str.charAt(0).toUpperCase() + str.slice(1);
}
const getData = async ({ slugSearch, cate, file, pageSize }) => {
    let logs = []
    let myData = []
    let { data } = await axios.post('https://discovery.tekoapis.com/api/v2/search-skus-v2', {
        "page": 1,
        "pageSize": pageSize,
        "slug": slugSearch,
        "terminalId": 4,
        "isNeedFeaturedProducts": true,
        "filte": {},
        "sorting": {
            "sort": "SORT_BY_PUBLISH_AT",
            "order": "ORDER_BY_DESCENDING"
        }
    })
    let dataProduct = data.data.products
    for (let p of dataProduct) {
        let attr = {}
        let url
        try {
            let { data: { result: { product } } } = await axios.get(`https://discovery.tekoapis.com/api/v1/product?sku=${p.sku}&location=&terminalCode=phongvu`)
            url= `https://discovery.tekoapis.com/api/v1/product?sku=${p.sku}&location=&terminalCode=phongvu`
            console.log('vao product detail',url)
            if (product.productInfo.name.includes("Hàng trưng bày")) {
                console.log("Bỏ qua hàng trưng bày")
                continue
            }
            attr.title = product.productInfo.name.split('/')[1].trim()
            attr.price = product.prices[0].supplierRetailPrice
            attr.discountPrice = product.prices[0].minLatestPrice
            attr.description = [product.productDetail.description]
            attr.quantity = Math.floor(Math.random() * 100);
            attr.soldQuantity = Math.floor(Math.random() * 90);
            //attr.category = cate
            attr.brand = product.productInfo.brand.code
            attr.totalRating = 0
            attr.slug = product.productInfo.canonical
            // tranh lay logo
            //attr.primaryImage = {url: product.productDetail.images[1].url}
            // k co logo
            attr.primaryImage = { url: product.productDetail.images[0].url }
            attr.colors = []
            let color = {}
            attr.configs = {}
            for (let p of product.productDetail.attributeGroups) {
                let package = {}
                if(p.name === "Series laptop"){
                    attr.series=p.value.toLowerCase()
                }
                // color
                if(p.name ==="Màu sắc"){
                    color.color = p.value
                }
                if(p.name === "CPU"){
                    package.priority = 1
                    package.value = p.value
                    attr.configs.cpu= package
                }
                if(p.name === "Chip đồ họa"){
                    package.priority = 2
                    package.value = p.value
                    attr.configs.graphicCard= package
                }
                if(p.name === "Màn hình"){
                    package.priority = 3
                    package.value = p.value
                    attr.configs.screen= package
                }
                if(p.name === "Ram"){
                    package.priority = 4
                    package.value = p.value
                    attr.configs.ram= package
                }
                if(p.name === "Lưu trữ"){
                    package.priority = 5
                    package.value = p.value
                    attr.configs.hardDrive= package
                }
                if(p.name === "Cổng kết nối"){
                    package.priority = 6
                    package.value = p.value
                    attr.configs.connectionPort= package
                }
                if(p.name === "Hệ điều hành"){
                    package.priority = 7
                    package.value = p.value
                    attr.configs.operatingSystem= package
                }
                if(p.name === "Kích thước"){
                    package.priority = 8
                    package.value = p.value
                    attr.configs.size= package
                }
                if(p.name === "Pin"){
                    package.priority = 9
                    package.value = p.value
                    attr.configs.battery= package
                }
                if(p.name === "Khối lượng"){
                    package.priority = 10
                    package.value = p.value
                    attr.configs.weight= package
                }
           
                if(p.name === "Nhu cầu"){
                    package.priority = 11
                    package.value = p.value
                    attr.configs.need= package
                }
                
            }
            // th phong vu k co color
            // if (!product?.productOptions?.rows[0]?.options) {
            //     logs.push({ mess: 'Không có tên color', id: product.productInfo.canonical })
            // } else {
            //     for (let c of product.productOptions.rows[0].options) {
            //         let color = {}
            //         color.images = []
            //         color.color = c.label
            //         let { data: { result: { product: { productDetail } } } } = await axios.get(`https://discovery.tekoapis.com/api/v1/product?sku=${c.sku}&location=&terminalCode=phongvu`)
            //         for (let i = 0; i < productDetail.images.length; i++) {
            //             color.images.push({ url: productDetail.images[i].url })
            //         }
            //         color.soldQuantity = Math.floor(attr.soldQuantity / product.productOptions.rows[0].options.length);
            //         color.quantity = Math.floor(attr.quantity / product.productOptions.rows[0].options.length);
            //         color.primaryImage = { url: productDetail.images[0].url }
            //         attr.colors.push(color)
            //     }
            // }
            // laptop
            color.images=[]
            color.primaryImage= { url: product.productDetail.images[1].url }
            color.quantity = attr.quantity
             color.soldQuantity = attr.soldQuantity
            for (let i = 0; i < product.productDetail.images.length; i++) {
               color.images.push({ url: product.productDetail.images[i].url })
            }
            attr.colors.push(color)
            myData.push(attr)
        }
        catch (e) {
            console.log('Error', e)
            logs.push({ mess: e.message, info: url }) 
        }
    }
    fs.writeFile(`${file}.json`, JSON.stringify(myData), (err) => {
        if (err) {
            console.log(`Lỗi khi ghi file ${file}.json`, err);
            throw err;
        };
        console.log('Đã lưu file data.json');
    });
    fs.writeFile(`logs.json`, JSON.stringify(logs), (err) => {
        if (err) {
            console.log(`Lỗi khi ghi file logs.json`, err);
            throw err;
        };
        console.log('Đã lưu file logs.json');
    });
}
// /c/iphone ,smartphone, appleData
//
const getListCS = async () =>{
    const x = await fetchUrlProductCellPhone({page:1})
}
async function main() {
    //await getData({ cate: 'ban-phim', slugSearch: '/c/laptop', file: 'laptopData', pageSize: 250 })
    await getListCS()
}
main()