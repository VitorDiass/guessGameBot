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

module.exports = {
    insertUser : function (id, name, score) {
        if (db) {
                var value = "(" + JSON.stringify(id) + "," + JSON.stringify(name) + ", " + score +")";
                //var value = [JSON.stringify(id),JSON.stringify(name),score];
                console.log(value);
                var sql = "INSERT INTO user (id,name,score) VALUES " + value ;
                console.log(sql);
                db.query(sql,function (err, result) {
                    if (err) throw err;
                    console.log("user inserted - " + result.affectedRows);
                    db.end();
                })
        } else {
            console.log("Error obtaining DB connection");
        }
    },

    updateUser : function(id,name,score){
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

    },

    getAllUsers : function(callback){
        if(db){
            var sql = "SELECT code,id,name,score FROM user ORDER BY score DESC";
             db.query(sql, function(err,result,fields){
                if(err) throw err;
               
            })
        }
    }
}

