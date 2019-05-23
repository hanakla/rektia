import Entity from '../Entity'

export interface IRelationMetadata {
    hasManyProperties: Set<[string, typeof Entity]>
}

export default class RelationMetadata {
    private static _metadata = new WeakMap<typeof Entity, IRelationMetadata>()

    public static addHasManyProperty(ModelClass: typeof Entity, property: string, RelationModelClass: typeof Entity)
    {
        if (!this._metadata.has(ModelClass)) {
            const relations: IRelationMetadata = {
                hasManyProperties: new Set()
            }

            this._metadata.set(ModelClass, relations)
        }

        const relations = this._metadata.get(ModelClass)

        if (relations) {
            const alreadyDefined = !!Array.from(relations.hasManyProperties).find(([definedProperty]) => definedProperty === property)
            if (!alreadyDefined) {
                relations.hasManyProperties.add([property, RelationModelClass])
            }
        }
    }

    public static getFor(ModelClass: typeof Entity): IRelationMetadata
    {
        return this._metadata.get(ModelClass)
    }
}
