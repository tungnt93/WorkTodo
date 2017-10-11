const SQLite 			 = require('react-native-sqlite-storage'); // plugin
const NativeEventEmitter = require('EventEmitter');		   // super worked

class SqlService extends NativeEventEmitter {

    constructor(props) {
        super(props);
    }

    async execute(sql, value, type) {
        type = type || "array";
        let db = SQLite.openDatabase("react.db", "1.0", "React Database", 200000);
        const tx = await (
            new Promise(resolve =>
                db.transaction(resolve)
            )
        );
        return await (
            new Promise((resolve, reject) => {
                switch (type) {
                    case "array":
                        tx.executeSql(sql, value, (tx, res) => {
                            let list = [];
                            res = res;
                            for (var i = 0; i < res.rows.length; i++)
                                list.push(res.rows.item(i));
                            resolve(list);
                        });
                        break;
                    case "object":
                        tx.executeSql(sql, value, (tx, res) => {
                            res = res;
                            resolve(res.rows.item(0));
                        });
                        break;
                    default:
                        tx.executeSql(sql, value, (tx, res) => {
                            let list = [];
                            res = res;
                            for (var i = 0; i < res.rows.length; i++)
                                list.push(res.rows.item(i));
                            resolve(list);
                        });
                        break;
                }
            })
        );
    }

    select(table, field = "*", where = "", values = null, order = null, limit = null) {
        var list = [];

        if (where) {
            var sql = 'SELECT ' + field + ' FROM ' + table + ' WHERE ' + where;
        } else {
            var sql = 'SELECT ' + field + ' FROM ' + table;
        }
        if (order)
            sql += " ORDER BY " + order;
        else
            sql += " ORDER BY id DESC";
        if(limit)
            sql += " LIMIT " + limit[0] + ", " + limit[1]; //limit[0]: vi tri bat dau, limit[1]: so phan tu
        return this.execute(sql, values || [], null).then(function(res) {
            return res;
        });
    }

    insert(table, row, values) {
        var sql = 'INSERT or REPLACE INTO ' + table + ' (';
        for (var i = 0; i < row.length; i++) sql += row[i] + ",";
        sql = sql.slice(0, sql.length - 1);
        sql += ') VALUES ';

        if (typeof values[0] == "object") {
            for (var i = 0; i < values.length; i++) {
                sql += '(';
                for (var j = 0; j < values[i].length; j++)
                    sql += (j != values[i].length - 1) ? "'" + values[i][j] + "'," : "'" + values[i][j] + "'),";
            }
            sql = sql.slice(0, sql.length - 1);
            values = [];
        } else {
            sql += "(";
            for (var i = 0; i < values.length; i++) sql += "?,";
            sql = sql.slice(0, sql.length - 1);
            sql += ")";
        }
        console.log(sql);
        return this.execute(sql, values || [], null).then(function(res) {
            return res;
        });
    }

    delete(table, where = null, values = null) {
        // if (where && values)
            var sql = 'DELETE FROM ' + table + ' WHERE ' + where;
        // else
        //     var sql = 'DELETE FROM ' + table;

        return this.execute(sql, values || [], "popup").then(function(res) {
            return res;
        });
    }

    update(table: string, row, values, where: string, wValues: Array<any>) {
        var sql = 'UPDATE ' + table + ' SET ';
        for (var i = 0; i < values.length; i++) sql += row[i] + "=?,";
        sql = sql.slice(0, sql.length - 1);
        sql += " WHERE " + where;
        if (wValues) {
            for (var i = 0; i < wValues.length; i++)
                values.push(wValues[i]);
        }
        console.log(sql);
        return this.execute(sql, values || [], "popup").then(function(res) {
            console.log(res);
            return res;
        });
    }

    getDetail(table: string, id, values = null){
        var sql = 'SELECT * FROM ' + table + ' WHERE id = ' + id;
        return this.execute(sql, values || [], "popup").then(function(res) {
            return res;
        });
    }

    query(sql: string, values: Array<any>): Promise<any> {
        return this.execute(sql, values, "popup").then(function(res) {
            return res;
        });
    }

    dropTable(table: string, values = null){
        var sql = 'DROP TABLE IF EXISTS ' + table;
        return this.execute(sql, values, "popup").then(function (res) {
            return res;
        });
    }

    createTableNote(){
        var sql = "CREATE TABLE IF NOT EXISTS 'note' ('id' INTEGER PRIMARY KEY AUTOINCREMENT, 'title' TEXT, 'content' TEXT, 'lastEdit' INTEGER, 'isDelete' INTEGER, 'serverId' INTEGER)";
        return this.execute(sql, null, "popup").then(function(res) {
            return res;
        });
    }

    createTableWork(){
        var sql = "CREATE TABLE IF NOT EXISTS 'work' ('id' INTEGER PRIMARY KEY AUTOINCREMENT, 'name' TEXT," +
            " 'type' INTEGER, 'status' INTEGER, 'repeatType' INTEGER, 'startDate' VARCHAR, 'endDate' VARCHAR, 'startUnix' INTEGER, 'endUnix' INTEGER," +
            " 'priority' INTEGER, 'description' TEXT, 'totalTodo' INTEGER, 'process' INTEGER, 'lastEdit' INTEGER, 'isDelete' INTEGER, 'serverId' INTEGER)";
        return this.execute(sql, null, "popup").then(function(res) {
            return res;
        });
    }

    createTableTodo(){
        var sql = "CREATE TABLE IF NOT EXISTS 'todo' ('id' INTEGER PRIMARY KEY AUTOINCREMENT, 'name' TEXT, 'status' BOOLEAN, 'work_id' INTEGER, 'workServerId' INTEGER, 'lastEdit' INTEGER, 'isDelete' INTEGER, 'serverId' INTEGER)";
        return this.execute(sql, null, "popup").then(function(res) {
            return res;
        });
    }

    // clearTable(table: string, values = null){
    //     var sql = 'DELETE FROM ' + table;
    //     return this.execute(sql, values, "popup").then(function (res) {
    //         return res;
    //     });
    // }

    selectFirst(table: string, values = null){
        var sql = 'SELECT id FROM ' + table + ' ORDER BY id DESC LIMIT 1';
        return this.execute(sql, values, "popup").then(function (res) {
            return res;
        });
    }

    checkId(table, id, values = null){
        var sql = 'SELECT * FROM ' + table + ' WHERE id = ' + id + ' LIMIT 1';
        return this.execute(sql,values,"popup").then(function (res) {
            return res;
        });
    }

    updateView(table, id, values = null){
        var sql = 'UPDATE ' + table + ' SET isView = 1 WHERE id = ' + id;
        return this.execute(sql,values,"popup").then(function (res) {
            return res;
        });
    }

    updateRow(table, row, values, where, wValues){
        var sql = 'UPDATE ' + table + ' SET ';
        for (var i = 0; i < values.length; i++) sql += row[i] + "=?,";
        sql = sql.slice(0, sql.length - 1);
        if (where) {
            sql += " WHERE " + where;
        }
        console.log(sql);
        return this.execute(sql, wValues || [], "popup").then(function(res) {
            console.log(res);
            return res;
        });

        // var setValue = '';
        // for(var i=0; i<column.length; i++){
        //     if(setValue){
        //         setValue = setValue + ', ' + column[i] + ' = ' + val[i];
        //     }
        //     else{
        //         setValue = column[i] + ' = ' + val[i];
        //     }
        // }
        // var sql = 'UPDATE ' + table + ' SET ' + setValue + ' WHERE id = ' + id;
        // console.log(sql);
        // return this.execute(sql, values, "popup").then(function (res) {
        //     return res;
        // });
    }
}
module.exports = new SqlService();