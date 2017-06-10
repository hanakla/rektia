import * as _ from 'lodash'
import * as Knex from 'knex'
import * as Promise from 'bluebird'

import Database from '../../Database'
import Entity from '../Entity'
import {LazyCollection} from '../LazyCollection'
import RelationMetadata from './RelationMetadata'
import * as ModelUtils from '../ModelUtil'

export type hasManyType<T> = LazyCollection<T>

export default function hasMany(RelationModel: typeof Entity) {
    return (belongsModel: Entity, property: string) => {
        const BelongsModel = belongsModel.constructor as typeof Entity
        RelationMetadata.addHasManyProperty(BelongsModel, property, RelationModel)

        Object.defineProperty(belongsModel, property, {
            get (this: Entity) {
                const tableName = ModelUtils.tableNameFromEntity(BelongsModel)
                const havingTableName = ModelUtils.tableNameFromEntity(RelationModel)
                const foreignKey = ModelUtils.externalIdFieldNameFromEntity(BelongsModel)

                const knex = Database.getConnection()
                return knex(havingTableName).select().where({[foreignKey]: this.get('id')})
            }
        })
    }
}

export function hasManyForBuilder(
    ForeignEntityClass: typeof Entity,
    queryBuilder: Knex.QueryBuilder,
    property: string,
    EntityClass: typeof Entity,
    foreignKeyId: {[field: string]: any}
): void;

export function hasManyForBuilder(
    ForeignEntityClass: typeof Entity,
    queryBuilder: Knex.QueryBuilder,
    property: string,
    EntityClass: typeof Entity,
    foreignKeyId: number
): void;

export function hasManyForBuilder(
    ForeignEntityClass: typeof Entity,
    queryBuilder: Knex.QueryBuilder,
    property: string,
    EntityClass: typeof Entity,
    foreignKeyId: number|{[field: string]: any}
): void {
    Object.defineProperty(queryBuilder, property, {
        get (this: Entity) {
            const tableName = ModelUtils.tableNameFromEntity(EntityClass)
            const foreignKey = ModelUtils.externalIdFieldNameFromEntity(EntityClass)
            const foreignTableName = ModelUtils.tableNameFromEntity(ForeignEntityClass)

            const knex = Database.getConnection()
            if (_.isObject(foreignKeyId)) {
                const criteria = foreignKeyId
                return knex(foreignTableName).select().where(criteria).leftJoin(tableName, `${tableName}.id`, `${foreignTableName}.${foreignKey}`)
            } else {
                return knex(foreignTableName).select().where({[foreignKey]: foreignKeyId})
            }
        }
    })
}
