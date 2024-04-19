import { openDatabase } from 'react-native-sqlite-storage';
import moment from 'moment';

const database = 'kingo.db';

export const insertDataCustomerSql =
  async (table, newData, idCustomer, uuid) => {
    let today = moment().utc().format("YYYY-MM-DDTHH:MM:ss")
    return new Promise((resolve, reject) => {
      let db = openDatabase({ name: database });
      db.transaction(txn => {
        txn.executeSql(
          `CREATE TABLE IF NOT EXISTS ${table} (id INTEGER PRIMARY KEY AUTOINCREMENT, idCustomer INTEGER, uuid TEXT, value TEXT, createdAt TEXT);`,
          [],
          (tx) => {
            tx.executeSql(
              `INSERT INTO ${table} (value, idCustomer, uui) VALUES (?, ?, ?, ?);`,
              [idCustomer, uuid, JSON.stringify(newData), today],
              (tx, results) => {
                if (results.rowsAffected > 0) {
                  resolve(results.insertId);
                } else {
                  resolve(null);
                }
              },
              (err) => {
                reject(err);
              }
            );
          },
          (err) => {
            reject(err);
          }
        );
      });
    });
  };

export const updateDataSql = async (table, idCustomer, newData) => {
    return new Promise((resolve, reject) => {
        let db = openDatabase({ name: database });
        db.transaction(txn => {
            txn.executeSql(
                `UPDATE ${table} SET value = ? WHERE idCustomer = ?;`,
                [JSON.stringify(newData), idCustomer],
                (tx, results) => {
                    if (results.rowsAffected > 0) {
                        console.log('Actualización exitosa....');
                        resolve(true);
                    } else {
                        console.log('Error al actualizar. No se encontró la fila....');
                        resolve(false);
                    }
                },
                err => {
                    reject(err);
                },
            );
        });
    });
};

export const deleteSql = async (table, idCustomer) => {
    return new Promise((resolve, reject) => {
        let db = openDatabase({ name: database });
        db.transaction(txn => {
            txn.executeSql(
                `DELETE FROM ${table} WHERE idCustomer = ${idCustomer};`,
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

export const insertOrUpdateDataSql = async (table, newData, idCustomer) => {
    return new Promise((resolve, reject) => {
      const db = openDatabase({ name: database });
      db.transaction(txn => {
        txn.executeSql(
            `CREATE TABLE IF NOT EXISTS ${table} (id INTEGER PRIMARY KEY AUTOINCREMENT, value TEXT, idCustomer INTEGER);`,
            [],
            (tx) => {
              // Check if the record already exists
              tx.executeSql(
                  `SELECT * FROM ${table} WHERE idCustomer = ?;`,
                  [idCustomer],
                  (tx, results) => {
                    if (results.rows.length > 0) {
                      // If the record exists, update it
                      tx.executeSql(
                          `UPDATE ${table} SET value = ? WHERE idCustomer = ?;`,
                          [JSON.stringify(newData), idCustomer],
                          (tx, updateResults) => {
                            if (updateResults.rowsAffected > 0) {
                              console.log('Actualización exitosa.');
                              resolve(updateResults.insertId);
                            } else {
                              console.log('Error al actualizar.');
                              reject(new Error('Error updating data'));
                            }
                          },
                          (err) => {
                            console.log('Error al actualizar', err);
                            reject(err);
                          }
                      );
                    } else {
                      // If the record doesn't exist, insert a new one
                      tx.executeSql(
                          `INSERT INTO ${table} (value, idCustomer) VALUES (?, ?)`,
                          [JSON.stringify(newData), idCustomer],
                          (tx, insertResults) => {
                            if (insertResults.rowsAffected > 0) {
                              console.log('Inserción exitosa. ID de la nueva fila: ' + insertResults.insertId);
                              resolve(insertResults.insertId);
                            } else {
                              console.log('Error al insertar datos.');
                              reject(new Error('Error inserting data'));
                            }
                          },
                          (err) => {
                            console.log('Error al insertar datos', err);
                            reject(err);
                          }
                      );
                    }
                  },
                  (err) => {
                    console.log('Error al verificar la existencia del registro', err);
                    reject(err);
                  }
              );
            },
            (err) => {
              console.log('Error al crear la tabla', err);
              reject(err);
            }
        );
      },
      (err) => {
        console.log('Error en la transacción de la base de datos', err);
        reject(err);
      });
    });
  };