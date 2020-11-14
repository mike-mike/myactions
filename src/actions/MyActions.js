import Sqlite from '../utils/sqlite';

export default class MyActions {
    static MY_ACTIONS_COUNT = 4;

    static getItems() {
        return new Promise(async (resolve, reject) => {
            let p1 = MyActions.getPromoutedAction();
            let p2 = MyActions.getMyActions();

            Promise.all([p1, p2]).then (values => {
                let promoted = values [0];
                let my = values[1];
                let actions = null;

                console.log("PROMOTED", promoted)
     
                if(promoted === null || my[MyActions.MY_ACTIONS_COUNT - 1].actionId === promoted.actionId) // return first 4 elements
                    actions = my.slice(0, MyActions.MY_ACTIONS_COUNT);
                else 
                    actions = MyActions.injectPromotedAction(my, promoted);

                // get action's details from db
                actions = MyActions.getDetails(actions);

                resolve(actions);
            })
        })
    }

    static getPromoutedAction(){
        return new Promise(resolve => {
            try {
                // generate random promoted action - for debug purposes only
                let promoted = {
                    actionId: Math.floor(Math.random() * 5 + 1), // generate random id from 1 to 6
                    type: 'promoted'
                }

                //TODO: get promoted actions from TCRM and return a first one
                    // return null if not exists
                //

                resolve(promoted);
            }
            catch(err) {
                // log error and return null
                console.log(err);
                resolve(null);
            }
        })
    }

    static getMyActions(){
        return new Promise(async (resolve) => {
            try{
                let expire = MyActions.expire;
                let sql = `SELECT actionId, COUNT(actionId) AS c FROM MyActions GROUP BY actionId HAVING DATE < ${expire} ORDER BY c DESC LIMIT ${MyActions.MY_ACTIONS_COUNT}`

                // get my actions
                let my = await Sqlite.executeQuery(sql);
          
                console.log("MY", my);

                // get additional actions
                if(my.length < MyActions.MY_ACTIONS_COUNT){
                    sql = MyActions.buildQuery(my);
                    let additional = await Sqlite.executeQuery(sql);
             
                    console.log("ADDITIONAL", additional)
                    resolve([...my, ...additional]);
                }
                else{
                    resolve(my);
                }
            }
            catch(err) {
                console.log("ERROR", err);
                resolve([])
            }
        })
    }

    static async getDetails(actions){
        // build query filter
        let filter = actions.reduce((acc, cur, index) => index == 0 ? cur.actionId : acc + "," + cur.actionId, '');
        let sql = `SELECT * FROM Actions WHERE id IN (${filter})`

        // get action details from db
        let details = await Sqlite.executeQuery(sql);

        // replace items in the source array to preserve items order
        for(let i = 0; i < actions.length; i++) {
            // search action details in the details array and replace 
            let detail = details.find(a => a.id == actions[i].actionId);
            actions[i] = {...actions[i], ...detail};
        }

        return actions;
    }

    static buildQuery(actions){
        if(actions.length == 0)
            return `SELECT actionId FROM AdditionalActions ORDER BY [order] asc LIMIT ${MyActions.MY_ACTIONS_COUNT}`;
        else {
            let filter = actions.reduce((acc, cur, index) => index == 0 ? cur.actionId : acc + "," + cur.actionId, '');
            let limit = MyActions.MY_ACTIONS_COUNT - actions.length;

            return `SELECT actionId FROM AdditionalActions WHERE actionId NOT IN (${filter}) ORDER BY [order] asc LIMIT ${limit}`;
        }
    }

    static injectPromotedAction(my, promoted){
        // remove promoted action from the array if exists
        let filtered = my.filter (action => action.actionId != promoted.actionId );

        console.log("FILTERED", filtered);

        // add or replace 4th element with promoted action
        if(filtered.length == 4)
            filtered[MyActions.MY_ACTIONS_COUNT - 1] = promoted;
        else
            filtered.push(promoted)

        // return first 4 elements
        return filtered.slice(0, MyActions.MY_ACTIONS_COUNT);
    }

    static save(actionId) {
        return new Promise((resolve, reject) => {
            let date = new Date().getTime();
            let expire = MyActions.expire;
            let sql1 = `INSERT INTO MyActions (actionId, date) VALUES (${actionId}, ${date})`;
            let sql2 = `DELETE FROM MyActions WHERE date WHERE date > ${expire}`;
            let p1 = Sqlite.executeNonQuery(sql1);
            let p2 = Sqlite.executeNonQuery(sql2);

            Promise.all([p1, p2])
                .then(values => {
                    resolve({status: 'ok'})
                })
                .catch(err => {
                    resolve({status: 'error'})
                })
        })
    }

    static get expire (){
        return  new Date().getTime() + 90 * 24 * 60 * 60 * 1000;
    }

    // FOR DEBUG
    static async generateMyActions(){
        for(let i = 0; i < 500; i++){
            let action = {
                id: Math.floor(Math.random() * 5 + 1),
                date: new Date().getTime() - Math.floor(Math.random() * 7776000000) // generate random time within 90 days
            }

            await Sqlite.saveAction(action);
        }
    }

    // FOR DEBUG
    static clearMyActions(){
        Sqlite.executeNonQuery("DELETE FROM MyActions");
    }
} 