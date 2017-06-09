import * as Knex from 'knex'

import RelationMetadata from './Relation/RelationMetadata'

import Model from './Model'
import {default as hasMany, hasManyForBuilder} from './Relation/hasMany'
import RecordNotFonundException from '../Exceptions/RecordNotFonundException'
import * as ModelUtil from './ModelUtil'

type Criteria<T> = {
    [K in keyof T]: T[K]
}

export default class ModelStatics {
    public static hasMany = hasMany

    public static _knex: Knex

    public static setConnection(_knex: Knex)
    {
        this._knex = _knex
    }

    public static find<T extends Model>(this: new () => T, id: number): Knex.ChainableInterface & T
    {
        const _this = (this as any as typeof Model)
        const tableName = ModelUtil.tableNameFromModel(_this)

        const queryBuilder = ModelStatics._knex.select().from(tableName).where('id', id).first()
        const relations = RelationMetadata.getFor(_this)
        console.log(_this, relations)

        if (relations) {
            for (let [prop, Model] of relations.hasManyProperties) {
                hasManyForBuilder(Model, queryBuilder, prop, _this, id)
            }
        }

        // if (record == null) {
        //     throw new RecordNotFonundException(`Couldn't find ${tableName} with 'id'=${id}`)
        // }

        return queryBuilder as any
    }


    public static　async findBy<T extends Model>(this: new () => T, criteria: Criteria<any>): Promise<T|null>
    {
        const _this = (this as any as typeof Model)
        const tableName = ModelUtil.tableNameFromModel(_this)

        const record = await ModelStatics.knex.select().from(tableName).where(criteria).first()

        return record ? record : null
    }

    private constructor() { }
}
