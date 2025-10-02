import dotenv from 'dotenv';
import { Kanpla } from './src/kanpla';

dotenv.config();
const kanpla = new Kanpla({
  FIREBASE_API_KEY: process.env.FIREBASE_API_KEY as string,
  FIREBASE_USERNAME: process.env.FIREBASE_USERNAME as string,
  FIREBASE_PASSWORD: process.env.FIREBASE_PASSWORD as string,
  MODULE_ID: process.env.MODULE_ID as string,
  LANGUAGE: 'nb',
});

async function main() {
  const allMenus = await kanpla.getAllMenus();
  console.log(`All menus:`, allMenus);

  //const menu = await kanpla.getMenusForDate(new Date('2025-09-30'));
  //console.log(`Today's menu:`, menu);
}

main();
