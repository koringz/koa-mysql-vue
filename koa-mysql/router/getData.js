/**
 * parse a get query data.
 */
function parseQueryStr (queryStr) {
    let queryData = {}
    let queryStrList = queryStr.split('&')
    console.log( queryStrList )
    for (  let [ index, queryStr ] of queryStrList.entries()  ) {
        let itemList = queryStr.split('=')
        queryData[ itemList[0] ] = decodeURIComponent(itemList[1])
    }
    return queryData
}

module.exports.getData = function (ctx) {
	return new Promise((resolve, reject) => {
		try {
            let parseData = ''
            let request = ctx.request
            let req_query = request.query
            let req_querystring = request.querystring
            console.log(ctx)
            let params = {
                req_query,
                req_querystring
            }
            resolve(params)
		} catch (err) {
			reject(err)
		}
	})
}