import { User } from '../../models/User'

export const createUserService = async () => {
    const user = new User({})
    await user.save()

    return user
}