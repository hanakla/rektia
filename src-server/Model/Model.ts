import * as _ from 'lodash'
import * as Knex from 'knex'
import * as pluralize from 'pluralize'

import ModelStatics from './ModelStatics'
import * as ModelUtil from './ModelUtil'

export { Model as default }

namespace Model {
    export interface LazyCollection<T extends Model> extends Knex {
        then(onFulfilled: (records: T[]) => void, onRejected): void
    }

    export type hasMany<T> = T
}

class Model<T = {[field: string]: any}> extends ModelStatics {
    /** Specified table name (optional) */
    public static tableName?: string
    public static primaryKey?: string = 'id'

    private _fields: Partial<T>
    private _isNew: boolean

    constructor(fields: Partial<T> = {}, isNew = true)
    {
        super()
        this._fields = fields
        this._isNew = isNew
    }

    public get<K extends keyof T>(field: K): T[K]
    {
        return this._fields[field]
    }

    public set(values: Partial<T>): this;
    public set<K extends keyof T>(field: K, value?: T[K]): this
    {
        const values: Partial<T> = {}

        if (arguments.length == 1) {
            Object.assign(values, field)
        } else {
            values[field] = value
        }

        Object.assign(this._fields, values)

        return this
    }

    public isValid()
    {

    }

    async save<T extends typeof Model>(): Promise<void>
    {
        const clazz = this.constructor as typeof Model as T
        const tableName = ModelUtil.tableNameFromModel((this as any).constructor as T)

        const insertQuery = ModelStatics._knex.insert(this._fields).where('id', (this._fields as any).id)
        const updateQuery = ModelStatics._knex.update(this._fields)
        // const query = `${insertQuery.toString()} ON DUPLICATE KEY UPDATE ${updateQuery.toString()}`
        // ._knex.table()

        if (this._isNew) {
            const [id] = await ModelStatics._knex
                .insert(this._fields)
                .into(tableName)
                .returning(clazz.primaryKey)

            ;(this._fields as any).id = id
            this._isNew = false
        } else {
            await ModelStatics._knex(tableName)
                .update(this._fields)
                .where({id: (this._fields as any).id})
        }
    }

    async delete() {}

    toJSON()
    {
        return _.clone(this._fields)
    }
}
