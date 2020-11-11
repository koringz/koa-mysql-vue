// 数据库方法
const dbModel = require('./../lib/mysql_db.js')
// post请求方法
const parseData = require('./postData.js')
// http参数验证
const validatorData = require('./../util/validator.js')
// 路由权限控制
const { sign } = require('jsonwebtoken')
const { jwt_secret } = require('./../config/secret.js')
// 文件事件
const fs = require('fs')
// 文件类型
const mime = require('mime-types');
const path = require('path')

// user 查找数据库
const private_methods_userlist =  (snipet, data) => {
	console.log('private_methods_userlist==',data)
    return new Promise( (resolve, reject) => {
		console.log('dbModel.connection typeof=',typeof dbModel.connection.query)
		dbModel.connection.query(snipet, function (error, results, fields) {
			if (error) throw error;
			resolve(results)
			// connected!
		  })
	})
}

// 登录
module.exports.api_user_login = async (ctx, next) => {
	let getParseData = await parseData.postData(ctx)
	let _validation_data = {
		name: "string",
		pass: "string",
	}

	// 进行验证post数据
	getParseData = eval( '(' + (getParseData) + ')' )
	let valid = await validatorData.ajv_validator_userform(getParseData, _validation_data)

	let params = {}
	if(!valid) {
		params = {
			code: 0,
			data: '用户名或密码不正确',
			success: valid
		}
	}
	else {
		var snipet = `select * from user_login where name="${getParseData.name}"`;

		let getUserDataList = await private_methods_userlist(snipet)
		console.log('getUserDataList==', getUserDataList)

		let len = getUserDataList.length
		if(!len) {
			// 这个用户
			// 是否查询到
			params = {
				code: 0,
				success: valid,
				data: '用户名或密码不正确',
			}
		}
		else {
			console.log('getParseData.pass 0=',getParseData.pass)
			// 密码不相同
			if(getUserDataList[0].pass !== getParseData.pass) {
				params = {
					code: 0,
					data: '用户名或密码不正确',
					success: valid
				}
			}
			else {
				const token = sign({ id: getParseData.id, name: getParseData.name }, jwt_secret, { expiresIn: '24h'  })
				// let payload = {
				// 	exp: Date.now() + tokenInvoker,
				// 	name: getParseData.name
				// }
				// for(let item in jwt.__proto__) {
				// 	console.log(item)
				// }
				// let token = jwt.encode(payload, setJwtSecret)

				delete getUserDataList[0].pass
				params = {
					code: 1,
					data: {
						token: token,
						userinfo: getUserDataList[0],
					},
					message: '成功',
					success: valid,
				}
			}
		}
	}
    ctx.body = params
    next()
}

// 用户列表接口方法
module.exports.api_userlist = async (ctx, next) => {
	let _query = ctx.request.query
	console.log('_query==', _query)
	let _validation_data = {
		page_index: "string",
		page_size: "string",
	}
	// 进行验证get数据
	let valid = await validatorData.ajv_validator_userform(_query, _validation_data)
	let page_index, search_data, create_times, updated_times, page_size;
	if(valid) {
		page_index = Number(_query.page_index)
		page_size = Number(_query.page_size) < 10 ? 10 : Number(_query.page_size) 
		search_data = _query.search_data
		create_times = _query.create_times
		updated_times = _query.updated_times
	}

	let params = {}
	if(!valid) {
		params = {
			code: 0,
			data: null,
			success: valid
		}
	}
	else {
		var  snipet
		// var  snipet = 'select * from userlist';
		if(search_data || create_times || updated_times) {
			let str = ''
			if(search_data != '' && search_data) {
				str += ` name like "%${search_data}%" `;
			}
			else if(create_times != '' && create_times) {
				str += ` name like "${create_times}" `;
			}
			else if(updated_times != '' && updated_times) {
				str += ` name like "%${updated_times}%" `;
			}
			snipet = `select * from userlist where ${str} and id limit ${page_size * (page_index-1) },${page_size * page_index};`;
		}
		else{
			snipet = `SELECT * FROM userlist  LIMIT ${page_size * (page_index-1)},${page_size};`;
		}
		console.log('snipet==',snipet)
		let getUserDataList = await private_methods_userlist(snipet, _query)

		var lastSnipet = 'select id from userlist where id>1 order by id desc limit 1;'
		let getLastCount = await private_methods_userlist(lastSnipet, _query)
		getLastCount = getLastCount[0]
		
		let len = getUserDataList.length
		if(getUserDataList) {
			params = {
				code: 1,
				total: getLastCount.id,
				data: getUserDataList,
				message: '成功',
				success: valid
			}
		}
	}
    ctx.body = params
    next()
}

// 删除 数据
module.exports.api_delete_item = async (ctx, next) => {
	let _query = ctx.request.query
	let getParseData = await parseData.postData(ctx)
	console.log('getParseData 1==', eval( '(' + (getParseData) + ')' ))

	let _validation_data = {
		name: "string",
	}

	// 进行验证post数据
	getParseData = eval( '(' + (getParseData) + ')' )
	let valid = await validatorData.ajv_validator_userform(getParseData, _validation_data)
	if(valid) {
		page_index = Number(_query.page_index)
	}

	let params = {}
	if(!valid) {
		params = {
			code: 0,
			data: null,
			success: valid
		}
	}
	else {
		console.log('getParseData=',getParseData)
		var snipet = `delete from userlist where name = "${getParseData.name}"`;
		console.log('snipet=',snipet)
		let getUserDataList = await private_methods_userlist(snipet)
		console.log('getUserDataList==', getUserDataList)
		let len = getUserDataList.length
		if(getUserDataList) {
			params = {
				code: len ? 1 : 0,
				data: getUserDataList,
				message: '插入数据成功',
				success: valid
			}
		}
	}
    ctx.body = params
    next()
}

// 添加 数据
module.exports.api_add_case = async (ctx, next) => {
	let getParseData = await parseData.postData(ctx)

	let _validation_data = {
		name: "string",
		type: "string",
		description: "string",
	}

	// 进行验证post数据
	getParseData = eval( '(' + (getParseData) + ')' )
	let valid = await validatorData.ajv_validator_userform(getParseData, _validation_data)

	let params = {}
	if(!valid) {
		params = {
			code: 0,
			data: null,
			success: valid
		}
	}
	else {
		console.log('getParseData=',getParseData)
		var snipet = `insert into userlist( name, type, description ) values( "${getParseData.name}", "${getParseData.type}", "${getParseData.description}" )`;
		console.log('snipet=',snipet)
		let getUserDataList = await private_methods_userlist(snipet)
		console.log('getUserDataList==', getUserDataList)
		let len = getUserDataList.length
		if(getUserDataList) {
			params = {
				code: 1,
				total: len,
				data: getUserDataList,
				message: '成功',
				success: valid
			}
		}
	}
    ctx.body = params
    next()
}

// 详情接口 
module.exports.api_detail_list = async (ctx, next) => {
	let _query = ctx.request.query
	console.log('_query==', _query)
	let _validation_data = {
		caseid: "string",
	}
	let valid = await validatorData.ajv_validator_userform(_query, _validation_data)
	console.log('valid=',valid)
	// 进行验证post数据
	let params = {}
	if(!valid) {
		params = {
			code: 0,
			data: null,
			success: valid
		}
	}
	else {
		var snipet = `select * from userlist where caseid=${_query.caseid}`;
		console.log('snipet=',snipet)
		let getUserDataList = await private_methods_userlist(snipet)
		console.log(getUserDataList)
		if(getUserDataList) {
			params = {
				code: 1,
				data: getUserDataList[0],
				message: '成功',
				success: valid,
			}
		}
	}
	
    ctx.body = params
    next()
}

// 上传文件
module.exports.api_upload = async (ctx, next) => {
	// console.log('ctx.request.file', ctx.request.file);
    // console.log('ctx.file', ctx.file);
	// console.log('ctx.request.body', ctx.request.body);
	let params = {}

	let files = ctx.request.file
	let filename = files.filename
	let path = files.path
	let mimetype = files.mimetype
	let size = files.size

	var snipet = `insert into filelist ( name, path, type, size) values ("${filename}", "${path}", "${mimetype}", "${size}")`;
	console.log('snipet=',snipet)
	let getUserDataList = await private_methods_userlist(snipet)
	if(getUserDataList) {
		params = {
			code: 1,
			data: getUserDataList,
			message: '成功',
		}
	}
	else {
		params = {
			code: 0,
			data: null,
		}
	}

    ctx.body = params
    next()
}


// 图片列表
module.exports.api_access_file = async (ctx, next) => {
	let _query = ctx.request.query
	console.log('_query==', _query)
	let _validation_data = {
		page_index: "string",
		page_size: "string",
	}
	// 进行验证get数据
	let valid = await validatorData.ajv_validator_userform(_query, _validation_data)
	let page_index, page_size;
	if(valid) {
		page_index = Number(_query.page_index)
		page_size = Number(_query.page_size) < 10 ? 10 : Number(_query.page_size) 
	}

	console.log('valid=',valid)
	// 进行验证post数据
	let params = {}
	if(!valid) {
		params = {
			code: 0,
			data: null,
			success: valid
		}
	}
	else {
		var snipet = `select * from filelist limit ${page_size * (page_index-1)},${page_size}`;
		console.log('snipet=',snipet)
		let getUserDataList = await private_methods_userlist(snipet)
		
		var lastSnipet = 'select id from filelist where id>1 order by id desc limit 1;'
		let getLastCount = await private_methods_userlist(lastSnipet, _query)
		console.log('getLastCount',getLastCount)
		
		let len = getLastCount[0].id
		if(getUserDataList) {
			params = {
				code: 1,
				success: valid,
				message: '成功',
				data: getUserDataList.reverse(),
				total: len
			}
		}
	}
	
    ctx.body = params
    next()
}


// 读取图片文件
module.exports.api_download_file = async (ctx, next) => {
	let _query = ctx.request.query
	console.log('_query==', _query)
	let _validation_data = {
		filename: "string",
	}
	let valid = await validatorData.ajv_validator_userform(_query, _validation_data)
	console.log('valid=',valid)

	let params = {}
	if(!valid) {
		params = {
			code: 0,
			data: null,
			success: valid
		}
	}
	else {
		//图片目录
		let filePath = path.join(__dirname, '../public_files')
		let file = null;
		try {
			file = fs.readFileSync(filePath)
		} catch (error) {
			//如果服务器不存在请求的图片，返回默认图片
			//默认图片地址
			filePath = path.join(__dirname, `../public_files/${_query.filename}`)
			file = fs.readFileSync(filePath); //读取文件       
		}
		//读取图片文件类型
		let mimeType = mime.lookup(filePath)
		//设置类型
		ctx.set('content-type', mimeType)
		params =  {
			code: 1,
			data: file,
			message: '成功',
		}
	}

	ctx.body = params
    next()
}

/*

	const key = `${SETTING_REDIS_KEY_PREFIX}_userlist_${JSON.stringify()}`
	console.log('key==',key)
	const getredisDATA = await getRedis(key)

*/