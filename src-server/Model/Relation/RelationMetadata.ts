import Model from '../Model'

export interface IRelationMetadata {
    hasManyProperties: Set<[string, typeof Model]>
}

export default class RelationMetadata {
    private static _metadata = new WeakMap<typeof Model, IRelationMetadata>()

    public static addHasManyProperty(ModelClass: typeof Model, property: string, RelationModelClass: typeof Model)
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

    public static getFor(ModelClass: typeof Model): IRelationMetadata
    {
        return this._metadata.get(ModelClass)
    }
}
