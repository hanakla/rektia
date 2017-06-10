import * as Knex from 'knex'
import DatabaseConnectionException from './Exceptions/DatabaseConnectionException'

export interface DBConnectionOption {
    client: string
    connection: {
        host: string
        user: string
        password?: string
        database: string
    }
}

export default class Database {
    private static _connections: {[name: string]: Knex}

    public static createConnection(name:string, options: DBConnectionOption)
    {
        const connection = Knex(options)
        this._connections[name] = connection
    }

    public static getConnection(name: string = 'default')
    {
        const connection = this._connections[name]

        if (!connection) {
            throw new DatabaseConnectionException(`Connection \`${name}\` not defined`)
        }

        return connection
    }
}
