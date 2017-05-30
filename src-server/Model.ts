import * as _ from 'lodash'
import * as Knex from 'knex'
import * as pluralize from 'pluralize'

import RecordNotFonundException from './Exceptions/RecordNotFonundException'

type Criteria<T> = {
    [K in keyof T]: T[K]
}

class ModelStatics {
    public static _knex: Knex

    private static getTableName<T extends typeof Model>(this: T)
    {
        return this.tableName || _.snakeCase(pluralize.plural(this.name))
    }


    public static async find<T extends Model>(this: new () => T, id: number): Promise<T>
    {
        const _this = (this as any as typeof Model)
        const tableName = _this.getTableName()

        const record = await _this._knex.select().from(tableName).where('id', id).first()

        if (record == null) {
            throw new RecordNotFonundException(`Couldn't find ${tableName} with 'id'=${id}`)
        }

        return (new _this(record) as any) as T
    }


    public static　async findBy<T extends Model>(this: new () => T, criteria: Criteria<any>): Promise<T|null>
    {
        const _this = (this as any as typeof Model)
        const tableName = _this.getTableName()

        const record = await _this._knex.select().from(tableName).where(criteria).first()

        return record ? record : null
    }
}

export default class Model<T = {[field: string]: any}>  extends ModelStatics {
    /** Specified table name (optional) */
    public static tableName?: string











    private _fields: Partial<T>

    constructor(fields: Partial<T> = {})
    {
        super()
        this._fields = fields
    }

    get<K extends keyof T>(field: K): T[K]
    {
        return null
    }

    set<K extends keyof T>(field: K): void
    {
        return null
    }

    // async save(): {}
}


type P = {test: string};
const m = new Model<P>()

m.get('test')d
