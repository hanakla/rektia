import {Model} from 'rektia'

export default class Item extends Model<app.Model.Item> {
    // @Model.ManyToMany(User, {through: Table})
    // friends: Model.LazyCollection
}

// async () => (await User.find(1)).friends.map(() =>{})

