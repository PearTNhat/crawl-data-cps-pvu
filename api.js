const { default: axios } = require("axios")

const fetchUrlProduct = async ({ slug }) => {
    try {
        const { data } = await axios.post('https://discovery.tekoapis.com/api/v2/search-skus-v2', {
            "page": 1,
            "pageSize": 250,
            "slug": slug,
            "terminalId": 4,
            "isNeedFeaturedProducts": true,
            "filte": {},
            "sorting": {
                "sort": "SORT_BY_PUBLISH_AT",
                "order": "ORDER_BY_DESCENDING"
            }
        })
        const urls = data.data.products.map(item => item.canonical)
        return urls

    } catch (error) {
        console.log(error)
    }
}
const fetchUrlProductCellPhone = async ({page}) => {
    try {
        const { data } = await axios.post('https://api.cellphones.com.vn/graphql-search/v2/graphql/query', {
            "query": `\n                    query advanced_search {\n                      advanced_search(\n                        user_query: { \n                            terms: \"laptop\",\n                            province: 8,\n                            \n                        }\n                        page: ${page}\n                        \n                      ) \n                      {\n                        posts {\n                          id\n                          title\n                          subtitle\n                          thumbnail\n                          slug\n                    \n       description\n                          status\n                          views\n                          rating\n                          total_rating\n                          created_at\n                          updated_at\n                          score\n                        }\n                        products {\n                          province_id\n                          product_id\n                          name\n                          product_condition\n                          sku\n                          url_path\n                          price\n                          prices\n                          special_price\n                          stock_available_id\n                          thumbnail\n                          sticker\n                          flash_sale_types\n                          promotion_information\n                          category_objects {\n                            path\n                            category_id\n                            level\n                            name\n                            uri\n                          }\n                          score\n                          view\n                        }\n                         related_categories {\n                          path\n                          category_id\n                          level\n                          name\n                          uri\n                          title_h1\n                        }\n                        meta {\n                          total\n                          page\n                        }\n                      }\n                    }\n`,
            "variables": {
            }
        })
        const list =[]
        const products = data.data.advanced_search.products
        for(let p of products){
            list.push(p.url_path)
        }
        return list
    } catch (error) {
        console.log(error)
    }
}
module.exports = { fetchUrlProduct,fetchUrlProductCellPhone }
