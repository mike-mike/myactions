import SQLite from "react-native-sqlite-storage";

export default class Sqlite {

    static db;

    static async connect(){
        //SQLite.DEBUG(true);

        Sqlite.db = await SQLite.openDatabase({ name: "main.db", createFromLocation: 1 }, () => {
            console.log('SQLite connecting OK');
        },
        (error) => {
            console.log("ERROR", error);
        });
    }

    static executeQuery(sql, params = []){
        return new Promise((resolve, reject) => {
            Sqlite.db.transaction(
                (tx) => {
                    tx.executeSql(sql, params,
                        (tx, result) => {
                            //console.log("RESULTS", result);
                            let items = [];

                            for (let i = 0; i < result.rows.length; i++) {
                                items.push(result.rows.item(i));
                            }
                           
                            resolve(items);
                        }
                    )
                },
                (err) => {
                    console.log(err)
                    resolve([]);
                }
            )
        })
    }

    static executeNonQuery(sql){
        return new Promise((resolve, reject) => {
            try {
                Sqlite.db.transaction(tx =>  {
                    console.log("executeNonQuery", sql)
                    tx.executeSql(sql, [],
                        (tx, result) =>  resolve(result)
                    )
                });
            }
            catch(err) {
                console.log(err)
                reject(err);
            }
        })
    }

    static disconnect(){
        Sqlite.db.close((error) => {
            if (error) {
                console.log('SQLite disconnecting error: ' + error.message);
            }
        });
    }
}

