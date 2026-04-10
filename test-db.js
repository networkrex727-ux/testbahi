
const mysql = require('mysql2/promise');

async function test() {
  const mysqlConfig = {
    user: 'primekha_fh',
    host: '51.195.40.96',
    database: 'primekha_fh',
    password: 'A6yV2HCv@VeEFt2',
    port: 3306,
    connectTimeout: 5000
  };

  try {
    console.log('Testing connection to:', mysqlConfig.host);
    const connection = await mysql.createConnection(mysqlConfig);
    console.log('Successfully connected!');
    await connection.end();
  } catch (error) {
    console.error('Connection failed:', error.message);
  }
}

test();
