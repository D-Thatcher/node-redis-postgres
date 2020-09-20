const assert = require('assert').strict;
const {pool} = require('../../config');

function connString(){
    assert(pool && pool.options && pool.options.connectionString && (!pool.options.connectionString.includes("undefined")))
}
async function testConnect() {
    console.log('Before connect');
    const client = await pool.connect();
    console.log('Connected!');
    client.release();
}

async function testSmallQuery() {
    console.log('Before small query');
    const sql = "SELECT 1";
    const result = await pool.query(sql);
    console.log('Small query returned %s rows', result.rows.length);
}

async function testBigQuery() {
    console.log('Before big query');
    const sql = "SELECT * FROM users";
    const result = await pool.query(sql);
    console.log('Big query returned %s rows', result.rows.length);
}

async function main() {
    connString()
    await testConnect();
    await testSmallQuery();
    await testBigQuery();
}

main()
    .then (() => {
        console.error('Done');
        process.exit(0);
    })
    .catch((err) => {
        console.error('Error: %s', err);
        console.error('Error: %s', err.stack);
        process.exit(1);
    });

main();