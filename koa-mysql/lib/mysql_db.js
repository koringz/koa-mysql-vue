const mysql = require('mysql');

var db = {}
function handleConnection () {
  db = mysql.createConnection({
    host     : '127.0.0.1',
    user     : 'root',
    port: 3306,
    password : '123456',
    database : 'test',
    useConnectionPooling: true // 
  });
  db.connect(handleError)
  db.on('error', handleError)
}

function handleError(err) {
    if (err) {
      console.error('error connecting: ' + err.stack);
      handleConnection()
      return;
    }
    console.log('connected as id ' + db.threadId);
}
  
handleConnection()
// 关闭连接
// connection.end();

module.exports.connection = db