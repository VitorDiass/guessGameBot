var mysql = require("mysql");

var connection = mysql.createConnection({
    host: "localhost",
    user: "vitor",
    password : "Vitordias10",
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
            db.end();
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
            db.end();
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
            db.end();
        })
    }else{
        console.log("Error obtaining DB connection");
    }

}

exports.getAllUsers = async function () {
    if (db) {
        var sql = "SELECT code,id,name,score FROM user ORDER BY score DESC";
        let res = await new Promise((resolve,reject) => db.query(sql, async function (err, result, fields) {
            if (err) reject(err);
            else {
                db.end();
                resolve(result);
            }
        }));
        return res;
    }
}    





