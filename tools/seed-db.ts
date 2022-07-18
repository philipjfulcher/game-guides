import { Database } from 'sqlite3'
import { open } from 'sqlite'



async function seed() {
    const db = await open({
        filename: '/tmp/database.db',
        driver: Database
    });

    await db.exec('CREATE TABLE IF NOT EXISTS completed_steps (ip_address TEXT, step TEXT)')
    await db.exec('INSERT INTO completed_steps VALUES ("75.71.237.243","prologue")')

}

(async () => {
    await seed();
    process.exit();
})();