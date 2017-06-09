const knex = require('knex')({
    client: 'mysql2',
    connection: {
        host: '127.0.0.1',
        user: 'root',
        password: 'mayakawa',
        database: 'rektia_test'
    }
});

// knex.select().from('users').first().then((records) => { console.log('record', records) })
(async () => {
    const r = await knex.insert([{id: null}, {id: null}]).into('users').returning('name')
    console.log(r)
})()

// module.exports = knex
