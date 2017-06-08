import * as Knex from 'knex'

import Model from './Model'
import RecordNotFonundException from '../Exceptions/RecordNotFonundException'
import * as ModelUtil from './ModelUtil'

type Criteria<T> = {
    [K in keyof T]: T[K]
}

export default class ModelStatics {
    static _knex: Knex = null

    public static setConnection(_knex: Knex)
    {
        console.log('Get connection')
        ModelStatics._knex = _knex
    }

    public static async find<T extends Model>(this: new () => T, id: number): Promise<T>
    {
        const _this = (this as any as typeof Model)
        const tableName = ModelUtil.tableNameFromModel(_this)

        console.log(ModelStatics)

        const record = await ModelStatics._knex.select().from(tableName).where('id', id).first()

        if (record == null) {
            throw new RecordNotFonundException(`Couldn't find ${tableName} with 'id'=${id}`)
        }

        return (new _this(record, false) as any) as T
    }


    public static　async findBy<T extends Model>(this: new () => T, criteria: Criteria<any>): Promise<T|null>
    {
        const _this = (this as any as typeof Model)
        const tableName = ModelUtil.tableNameFromModel(_this)

        const record = await ModelStatics._knex.select().from(tableName).where(criteria).first()

        return record ? record : null
    }
}
