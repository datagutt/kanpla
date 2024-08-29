import {Kanpla} from './src/kanpla';
import dotenv from 'dotenv';
dotenv.config();
const kanpla = new Kanpla({
  FIREBASE_API_KEY: process.env.FIREBASE_API_KEY as string,
  FIREBASE_USERNAME: process.env.FIREBASE_USERNAME as string,
  FIREBASE_PASSWORD: process.env.FIREBASE_PASSWORD as string,
  SUPPLIER: process.env.SUPPLIER as string,
  MODULE_ID: process.env.MODULE_ID as string,
  LANGUAGE: 'no',
});

async function main() {
  const allMenus = await kanpla.getAllMenus();
  ///	console.log(`All menus:`, allMenus)

  const menu = await kanpla.getMenusForDate(new Date('2024-08-21'));
  console.log(`Today's menu:`, menu);
}

main();
