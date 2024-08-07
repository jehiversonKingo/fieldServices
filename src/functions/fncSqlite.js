import {openDatabase} from 'react-native-sqlite-storage';

const database = 'kingo.db';

export const getAllDataStep = async(table, columns = '*') => {
  return new Promise((resolve, reject) => {
    let db = openDatabase({name: database});
    db.transaction(txn => {
      console.log(
        '[ QUERY ] => ',
        `SELECT * FROM ${table}`,
      );
      txn.executeSql(
        `SELECT ${columns} FROM ${table}`,
        [],
        (tx, results) => {
          var temp = [];
          console.log("TOTAL ROWS +++++> ", results.rows.length)
          for (let i = 0; i < results.rows.length; i++) {
            console.log('ITEM >> ', i);
            let currentRow = results.rows.item(i);
            temp.push(JSON.parse(currentRow.value));
          }
          if (temp.length > 0) {
            // let stringToJSon = [];
            //   temp.forEach((data) => {
            //     console.log("VALUE", data);
            //     stringToJSon.push(data);
            //   });
            console.log('[ TEMP ]', temp);
            resolve(temp);
          } else resolve([]);
        },
        err => {
          console.log(err)
          resolve([]);
          reject(err);
        },
      );
    });
  });
};

export const getStep = async(table, idRowModule, step) => {
  return new Promise((resolve, reject) => {
    let db = openDatabase({name: database});
    db.transaction(txn => {
      console.log(
        '[ QUERY ] => ',
        `SELECT * FROM ${table} WHERE idRowModule = ${idRowModule} AND step = ${step}`,
      );
      txn.executeSql(
        `SELECT * FROM ${table} WHERE idRowModule = ${idRowModule} AND step = ${step};`,
        [],
        (tx, results) => {
          var temp = [];
          for (let i = 0; i < results.rows.length; i++) {
            let currentRow = results.rows.item(i);
            temp.push(JSON.parse(currentRow.value));
          }
          if (temp.length > 0) {
            resolve(temp[temp.length - 1]);
          } else { resolve([]); }
        },
        err => {
          resolve([]);
          reject(err);
        },
      );
    });
  });
};

export const updateStep = async(table, idRowModule, params, step) => {
  return new Promise((resolve, reject) => {
    let db = openDatabase({name: database});
    db.transaction(txn => {
      txn.executeSql(
        `CREATE TABLE IF NOT EXISTS ${table}(id INTEGER PRIMARY KEY AUTOINCREMENT, idRowModule INTEGER, value TEXT, step INTEGER);`,
        [],
        async tx => {
          // let findData = await JSON.parse(getStep(table, idRowModule, step))
          // console.log('FIND', findData);
          tx.executeSql(
            `INSERT INTO ${table}(idRowModule, value, step) VALUES (?,?,?);`,
            [idRowModule, JSON.stringify(params), step],
            (t, results) => {
              if (results.rowsAffected > 0) {
                resolve(true);
              } else {
                resolve(true);
              }
            },
            err => console.log(err),
          );
        },
        err => {
          console.log('[ ERROR UPDATE ] => ', err);
          reject(err);
        },
      );
    });
  });
};

export const deleteStep = async (table, idRowModule) => {
  return new Promise((resolve, reject) => {
    let db = openDatabase({name: database});
    db.transaction(txn => {
      txn.executeSql(
        `DELETE FROM ${table} WHERE idRowModule = ${idRowModule};`,
        [],
        (tx, results) => {
          if (results.rowsAffected > 0) {
            console.log('Deleting Successfully....');
            resolve(true);
          } else {
            console.log('Failed....');
            resolve(true);
          }
        },
        err => {
          resolve(false);
          reject(err);
        },
      );
    });
  });
};


export const getAllDataSql = async (table) => {
  return new Promise((resolve, reject) => {
      let db = openDatabase({ name: database });
      db.transaction(txn => {
          txn.executeSql(
              `SELECT * FROM ${table}`,
              [],
              (tx, results) => {
                  var temp = [];
                  for (let i = 0; i < results.rows.length; i++) {
                      let currentRow = results.rows.item(i);
                      temp.push(JSON.parse(currentRow.value));
                  }
                  if (temp.length > 0) {
                      let stringToJSon = [];
                      temp.map((data) => {
                          stringToJSon.push(JSON.parse(data));
                      });
                      resolve(stringToJSon);
                  } else { resolve([]); }
              },
              err => {
                  resolve([]);
                  reject(err);
              },
          );
      });
  });
};

export const getSingleDataSql = async (table, nameParam, idParam) => {
  return new Promise((resolve, reject) => {
      let db = openDatabase({ name: database });
      db.transaction(txn => {
          txn.executeSql(
              `SELECT * FROM ${table} WHERE ${nameParam} = ?;`,
              [idParam],
              (tx, results) => {
                  if (results.rows.length > 0) {
                      let currentRow = results.rows.item(0);
                      let singleData = JSON.parse(currentRow.value);
                      resolve(singleData);
                  } else {
                      resolve(null);
                  }
              },
              err => {
                  reject(err);
              },
          );
      });
  });
};