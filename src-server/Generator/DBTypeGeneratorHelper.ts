import * as Knex from 'knex'
import * as _ from 'lodash'
import * as pluralize from 'pluralize'

export const modelClassNameFromTableName = (tableName: string) => {
    return _.capitalize(pluralize.singular(tableName))
}

export const columnTypeToTypeScriptType = (columnDef: Knex.ColumnInfo) => {
    let type

    switch (columnDef.type.toLowerCase()) {
        case 'tinyint':
            type = columnDef.maxLength === 1 ? 'boolean' : 'number'
            break

        case 'bit':
        case 'int':
        case 'integer':
        case 'smallint':
        case 'midiumint':
        case 'bigint':
        case 'decimal':
        case 'numeric':
        case 'float':
        case 'double':
            type = 'number'
            break

        case 'bool':
        case 'boolean':
            type = 'boolean'
            break

        case 'char':
        case 'varchar':
        case 'text':
        case 'midiumtext':
        case 'midiumtext':
        case 'longtext':
            type = 'string'
            break

        case 'timestamp':
            // 自動更新される値を手動更新するな💢
            // DATETIME型を使え💢
            type = 'Readonly<Date>'
            break

        case 'year':
            type = 'number'
            break

        case 'date':
        case 'datetime':
            type = 'Date'
            break

        case 'enum':
            type = 'string'
            break

        case 'set':
            type = 'Set<string>'
            break

        default:
            type = 'any'
            break
    }

    if (columnDef.nullable) {
        type += '|null'
    }

    return type
}
