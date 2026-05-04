import Sequelize  from "sequelize";

import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

const sequelize = new Sequelize(
  process.env.MYSQL_DATABASE_NAME,
  process.env.MYSQL_USER,
  process.env.MYSQL_PASSWORD,
  {
    host: process.env.MYSQL_HOST,
    port: process.env.MYSQL_PORT,
    dialect: 'mysql',
    dialectOptions: {
      ssl: {
        ca: fs.readFileSync(process.env.CA)
      }
    }
  }
);


const connectToDatabase = async () => {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');
      } catch (error) {
        console.error('Unable to connect to the database:', error);
      }
};


export {connectToDatabase, sequelize};