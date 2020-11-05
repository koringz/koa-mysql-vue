/**
 * parse a post query data.
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

module.exports.postData = function (ctx) {
	return new Promise((resolve, reject) => {
		try {
			let parseData = ''
			ctx.req.addListener('data', (data) => {
				parseData += data
			})
			ctx.req.addListener('end', function () {
				// parseData = parseQueryStr(parseData)
				resolve(parseData)
			})
		} catch (err) {
			reject(err)
		}
	})
}