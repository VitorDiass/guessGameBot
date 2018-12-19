var mysql = require("mysql");

var connection = mysql.createConnection({
    host: "localhost",
    user: "",
    password : "",
    database : "guessGame"
})

connection.connect(function (err) {
    if(err) throw err;
    console.log("connected");
    })

global.db = connection;


exports.insertUser = function (id,name,score){
    if (db) {
        var value = "(" + JSON.stringify(id) + "," + JSON.stringify(name) + ", " + score + ")";
        //var value = [JSON.stringify(id),JSON.stringify(name),score];
        console.log(value);
        var sql = "INSERT INTO user (id,name,score) VALUES " + value;
        console.log(sql);
        db.query(sql, function (err, result) {
            if (err) throw err;
            console.log("user inserted - " + result.affectedRows);
        
        })
    } else {
        console.log("Error obtaining DB connection");
    }
}

exports.updateUser = function(id,name){
    if(db){
        var values = [name,id];
        var sql = "UPDATE user SET name = ? where id = ?";
        db.query(sql,values,function(err,result){
            if(err)throw err;
            console.log("user updated - " + result.affectedRows);
          
        })
    }else{
        console.log("Error obtaining DB Connection");
    }
}

exports.updateUserScore = function (id,name,score){
    if(db){
        var values = [name,score,id];
        console.log(values);
        var sql = "UPDATE user SET name = ?, score = ? where id = ?";
        db.query(sql,values, function(err, result) {
            if(err) throw err;
            console.log("user updated - " + result.affectedRows);
           
        })
    }else{
        console.log("Error obtaining DB connection");
    }

}



exports.getAllUsers = async function () {
    if (db) {
        var sql = "SELECT code,id,name,score FROM user ORDER BY score DESC";
        let res = await new Promise((resolve,reject) => db.query(sql, function (err, result, fields) {
            if (err) reject(err);
            else {
              
                resolve(result);
            }
        }));
        return res;
    }
}

exports.getUserById = async function (id) {
    if (db) {
        let values = [id];
        var sql = "SELECT code,id,name,score FROM user where id=?";
        let res = await new Promise((resolve,reject) => db.query(sql,values, function (err, result, fields) {
            if (err) reject(err);
            else {
               
                resolve(result);
            }
        }));
        return res;
    }
}

exports.getSongs = async function (condition) {
    if (db) {
        let cond = condition !== null && condition !== undefined ? condition : "";
        var sql = "select t.id, t.nome as songName, t.mp3 as fileName, ta.nome as albumName, ta.abbreviation as albumAbb, tb.nome as bandName, tb.abbreviation as bandAbb from song t \
        inner join album ta on ta.id = t.album_Id \
        inner join band tb on tb.id = ta.band_Id " + cond;

        let res = await new Promise((resolve, reject) => db.query(sql, function (err, result, fields) {
            if (err) reject(err);
            else {
                resolve(result);
            }
        }));
        return res;
    }
}






