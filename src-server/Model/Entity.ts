import * as _ from 'lodash'
import * as Knex from 'knex'
import * as pluralize from 'pluralize'

import Database from '../Database'
import EntityStatics from './EntityStatics'
import * as ModelUtil from './ModelUtil'

import {hasManyType} from './Relation/HasMany'

export { Entity as default }

namespace Entity {
    export interface LazyCollection<T extends Entity> extends Knex {
        then(onFulfilled: (records: T[]) => void, onRejected): void
    }

    export type hasMany<T> = hasManyType<T>
}

class Entity<T = {[field: string]: any}> extends EntityStatics {
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

    async save<T extends typeof Entity>(): Promise<void>
    {
        const clazz = this.constructor as typeof Entity as T
        const tableName = ModelUtil.tableNameFromEntity((this as any).constructor as T)

        const knex = Database.getConnection()
        const insertQuery = knex.insert(this._fields).where('id', (this._fields as any).id)
        const updateQuery = knex.update(this._fields)
        // const query = `${insertQuery.toString()} ON DUPLICATE KEY UPDATE ${updateQuery.toString()}`
        // ._knex.table()

        if (this._isNew) {
            const [id] = await knex
                .insert(this._fields)
                .into(tableName)
                .returning(clazz.primaryKey)

            ;(this._fields as any).id = id
            this._isNew = false
        } else {
            await knex(tableName)
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
