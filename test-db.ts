import mysql from 'mysql2/promise';

const mysqlConfig = {
  user: 'primekha_fh',
  host: '51.195.40.96',
  database: 'primekha_fh',
  password: 'A6yV2HCv@VeEFt2',
  port: 3306
};

async function testConnection() {
  try {
    console.log('Testing connection to:', mysqlConfig.host);
    const connection = await mysql.createConnection(mysqlConfig);
    console.log('Connection successful!');
    await connection.end();
  } catch (error: any) {
    console.error('Connection failed!');
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    
    if (error.message.includes('not allowed to connect to this MySQL server')) {
      // Try to get the IP from the error message
      const match = error.message.match(/Host '([^']+)'/);
      if (match) {
        console.log('\nCRITICAL: You need to whitelist this IP in your cPanel/Remote MySQL:');
        console.log(match[1]);
      }
    }
  }
}

testConnection();
