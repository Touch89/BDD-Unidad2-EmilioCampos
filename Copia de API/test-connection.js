const mysql = require('mysql2/promise');

async function testConnection() {
    try {
        const pool = mysql.createPool({
            host: 'localhost',
            user: 'api_user',
            password: 'api_password',
            database: 'tarea_api',
            port: 3307
        });

        console.log('Intentando conectar a MySQL...');
        const [rows] = await pool.query('SELECT * FROM usuarios');
        console.log('✅ Conexión exitosa!');
        console.log('Usuarios encontrados:', rows.length);
        console.log('Datos:', rows);
        
        await pool.end();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error de conexión:', error.message);
        process.exit(1);
    }
}

testConnection();
