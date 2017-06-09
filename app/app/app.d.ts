declare namespace app {
    namespace Model {
        interface User {
            id: number
            display_name: string
            name: string
        }

        interface Item {
            id: number
            user_id: number
        }
    }
}
