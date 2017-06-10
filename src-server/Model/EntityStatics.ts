import * as Knex from 'knex'

import RelationMetadata from './Relation/RelationMetadata'

import Database from '../Database'
import Entity from './Entity'
import {default as hasMany, hasManyForBuilder} from './Relation/hasMany'
import RecordNotFonundException from '../Exceptions/RecordNotFonundException'
import * as ModelUtil from './ModelUtil'

type Criteria<T> = {
    [K in keyof T]: T[K]
}

export default abstract class EntityStatics {
    public static hasMany = hasMany

    public static find<T extends Entity>(this: new () => T, id: number): Knex.ChainableInterface & T
    {
        const _this = (this as any as typeof Entity)
        const tableName = ModelUtil.tableNameFromEntity(_this)

        const knex = Database.getConnection()
        const queryBuilder = knex.select().from(tableName).where('id', id).first()


        const relations = RelationMetadata.getFor(_this)

        if (relations) {
            for (let [prop, Model] of relations.hasManyProperties) {
                hasManyForBuilder(Model, queryBuilder, prop, _this, id)
            }
        }

        return queryBuilder as any
    }

    public static　async findBy<T extends Entity>(this: new () => T, criteria: Criteria<T>): Promise<T|null>
    {
        const _this = (this as any as typeof Entity)
        const tableName = ModelUtil.tableNameFromEntity(_this)

        const knex = Database.getConnection()
        const record = await knex.select().from(tableName).where(criteria as any).first()

        return record ? record : null
    }
}
