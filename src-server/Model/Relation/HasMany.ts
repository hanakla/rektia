import * as Knex from 'knex'
import * as Promise from 'bluebird'

import {LazyCollection} from '../LazyCollection'
import Model from '../Model'
import ModelStatics from '../ModelStatics'
import * as ModelUtils from '../ModelUtil'
import RelationMetadata from './RelationMetadata'

export type hasManyType<T> = LazyCollection<T>

export default function hasMany(RelationModel: typeof Model) {
    return (belongsModel: Model, property: string) => {
        const BelongsModel = belongsModel.constructor as typeof Model
        console.log(RelationMetadata, property)
        RelationMetadata.addHasManyProperty(BelongsModel, property, RelationModel)

        Object.defineProperty(belongsModel, property, {
            get (this: Model) {
                const tableName = ModelUtils.tableNameFromModel(BelongsModel)
                const havingTableName = ModelUtils.tableNameFromModel(RelationModel)
                const foreignKey = ModelUtils.externalIdFieldNameFromModel(BelongsModel)

                return ModelStatics._knex(havingTableName).select().where({[foreignKey]: this.get('id')})
            }
        })
    }
}

export function hasManyForBuilder(
    RelationModel: typeof Model,
    queryBuilder: Knex.QueryBuilder,
    property: string,
    BelongsModel: typeof Model,
    foreignKeyId: number
) {
    Object.defineProperty(queryBuilder, property, {
        get (this: Model) {
            const tableName = ModelUtils.tableNameFromModel(BelongsModel)
            const havingTableName = ModelUtils.tableNameFromModel(RelationModel)
            const foreignKey = ModelUtils.externalIdFieldNameFromModel(BelongsModel)

            return ModelStatics._knex(havingTableName).select().where({[foreignKey]: foreignKeyId})
        }
    })
}
