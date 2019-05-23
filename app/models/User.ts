import { Entity } from '@ragg/rektia'
import Item from '../models/Item'

export class User extends Entity<{ id: string, name: string }> {
    @Entity.hasMany(Item)
    items: Entity.hasMany<app.Entity.Item>
}
