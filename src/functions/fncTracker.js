import { openDatabase } from 'react-native-sqlite-storage';
import { getAsyncStorageData } from '../helper/helpers';

const db = openDatabase({ name: 'dev' });

export const createFieldTrackerTable = () => {
    db.transaction(tx => {
        tx.executeSql(
            `CREATE TABLE IF NOT EXISTS Fieldtracker (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                idUser INTEGER NOT NULL,
                idTask INTEGER NOT NULL,
                status TEXT,
                GPS TEXT,
                createdAt TEXT
            )`,
            [],
            (sqlTxn, res) => console.log('Fieldtracker table created'),
            error => console.log('Error creating Fieldtracker table', error.message)
        );
    });
};

export const insertLocationToDatabase = async (locationData, task, status) => {
    try {
        const data = await getAsyncStorageData("@Tracking");
        const {idUser, idTask} = task;

        if (!idUser) {
            throw new Error("idUser es requerido y no puede ser nulo.");
        }

        console.warn("ESTE USUARIO SE GUARDARA", idUser, idTask, status, locationData.GPS, new Date().toISOString());
        
        db.transaction(tx => {
            tx.executeSql(
                `INSERT INTO Fieldtracker (idUser, idTask, status, GPS, createdAt) VALUES (?, ?, ?, ?, ?)`,
                [idUser, idTask, status, locationData.GPS, new Date().toISOString()],
                () => console.log('Location added to database'),
                error => console.log('Error inserting location', error.message)
            );
        });
    } catch (error) {
        console.log("Error al obtener datos de AsyncStorage o al insertar en la BD:", error);
    }
};

export const insertLocationFijoToDatabase = async (data) => {
  try {
    console.log("PASE A ESTE")
    return new Promise((resolve, reject) => {
    db.transaction(tx => {
          tx.executeSql(
              `INSERT INTO Fieldtracker (idUser, idTask, GPS, Date) VALUES (?, ?, ?, ?)`,
              [data.idUser, data.idMenuAction, data.code, data.GPS, data.Date, data.velocity],
              (tx, results) => {
                console.log('Location added to database')
                resolve(results);
            },
              error => {
                console.log('Error inserting location', error.message)
                resolve(null);
              }
          );
      });
    });
  } catch (error) {
      console.log("Error al obtener datos de AsyncStorage:", error);
      return false;
  }
};

export const getLocationsFromDatabaseByIdTask = (idTask) => {
    return new Promise((resolve, reject) => {
      db.transaction((tx) => {
        tx.executeSql(
          `SELECT * FROM Fieldtracker WHERE idTask = ? ORDER BY id ASC`,
          [idTask],
          (tx, res) => {
            const locations = [];
            const len = res.rows.length;
  
            for (let i = 0; i < len; i++) {
              locations.push(res.rows.item(i));
            }
  
            console.log("[Locations Found]:", locations);
            resolve(locations);
          },
          (error) => {
            console.error("[SQL Error]:", error);
            resolve([]);
          }
        );
      });
    });
  };
  
export const getLocationsFromDatabase = () => {
    return new Promise((resolve, reject) => {
        db.transaction(tx => {
            tx.executeSql(
                `SELECT * FROM Fieldtracker ORDER BY id ASC`,
                [],
                (tx, res) => {
                    const len = res.rows.length;
                    const locations = [];
                    for (let i = 0; i < len; i++) {
                        locations.push(res.rows.item(i));
                    }
                    console.log("KKKKKKKKKK",locations);
                    resolve(locations);
                },
                error => reject(error)
            );
        });
    });
};

export const deleteLocationsFromDatabase = (id) => {
    db.transaction(tx => {
        tx.executeSql(
            `DELETE FROM Fieldtracker`,
            [],
            () => console.log('All locations deleted from database'),
            error => console.log('Error deleting locations', error.message)
        );
    });
};

export const deleteLocationsFromDatabaseByStatusAndTask = (idTask, taskStatus) => {
    db.transaction(tx => {
        tx.executeSql(
            `DELETE FROM Fieldtracker WHERE idTask = ? AND status = ?`,
            [idTask, taskStatus],
            () => console.log('All locations deleted from database'),
            error => console.log('Error deleting locations', error.message)
        );
    });
};

export const deleteLocationsFromDatabaseByIdTask = (idTask) => {
    db.transaction(tx => {
        tx.executeSql(
            `DELETE FROM Fieldtracker WHERE idTask = ?`,
            [idTask],
            () => console.log('All locations deleted from database'),
            error => console.log('Error deleting locations', error.message)
        );
    });
};

export const deleteLocationsFromAllDatabase = () => {
    db.transaction(tx => {
        tx.executeSql(
            'DELETE FROM Fieldtracker',
            [],
            () => console.log('All locations deleted from database'),
            error => console.log('Error deleting locations', error.message)
        );
    });
};

export const createActivityUserTable = () => {
    db.transaction(tx => {
        tx.executeSql(
            `CREATE TABLE IF NOT EXISTS ActivityUser (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                idUser INTEGER NOT NULL,
                idTask INTEGER NOT NULL,
                GPS TEXT,
                Date TEXT,
            )`,
            [],
            (sqlTxn, res) => console.log('ActivityUser table created'),
            error => console.log('Error creating ActivityUser table', error.message)
        );
    });
};

export const getActivitUser = () => {
    return new Promise((resolve, reject) => {
        db.transaction(tx => {
            tx.executeSql(
                `SELECT * FROM ActivityUser ORDER BY id ASC`,
                [],
                (tx, res) => {
                    const len = res.rows.length;
                    const locations = [];
                    for (let i = 0; i < len; i++) {
                        locations.push(res.rows.item(i));
                    }
                    console.log(locations);
                    resolve(locations);
                },
                error => {
                    resolve([]);
                    reject(error);
                },
                
            );
        });
    });
};

export const getActivitUserById = (idActivityUserMenuAction) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT * FROM ActivityUser WHERE idActivityUserMenuAction = ? ORDER BY id ASC`,
        [idActivityUserMenuAction],
        (tx, res) => {
          const len = res.rows.length;
          const locations = [];
          for (let i = 0; i < len; i++) {
            locations.push(res.rows.item(i));
          }
          console.log(locations);
          resolve(locations);
        },
        error => reject(error)
      );
    });
  });
};

export const insertLocationActivityUser = async (locationData) => {
    try {
        const data = await getAsyncStorageData("@ActivityUser");
        const { idActivityUserMenuAction } = data;
        db.transaction(tx => {
            tx.executeSql(
                `INSERT INTO ActivityUser (idActivityUserMenuAction, GPS, Date, velocity) VALUES (?, ?, ?, ?)`,
                [idActivityUserMenuAction, locationData.GPS, locationData.Date, locationData.velocity],
                () => console.log('Location added to database'),
                error => console.log('Error inserting location', error.message)
            );
        });
    } catch (error) {
        console.log("Error al obtener datos de AsyncStorage o al insertar en la BD:", error);
    }
};

export const insertLocationActivityUserFija = async (locationData) => {
    try {
        db.transaction(tx => {
            tx.executeSql(
                `INSERT INTO ActivityUser (idActivityUserMenuAction, GPS, Date, velocity) VALUES (?, ?, ?, ?)`,
                [locationData.idActivityUserMenuAction, locationData.GPS, locationData.Date, locationData.velocity],
                () => console.log('Location added to database'),
                error => console.log('Error inserting location', error.message)
            );
        });
    } catch (error) {
        console.log("Error al obtener datos de AsyncStorage o al insertar en la BD:", error);
    }
};

export const deleteRegisteActivityUser = (id) => {
    db.transaction(tx => {
        tx.executeSql(
            `DELETE FROM ActivityUser WHERE id = ${id}`,
            [],
            () => console.log('All locations deleted from database'),
            error => console.log('Error deleting locations', error.message)
        );
    });
};

export const deleteAllRegisteActivityUser = () => {
    db.transaction(tx => {
        tx.executeSql(
            'DELETE FROM ActivityUser',
            [],
            () => console.log('All locations deleted from database'),
            error => console.log('Error deleting locations', error.message)
        );
    });
};