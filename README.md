# Kanpla API Client

[![npm version](https://img.shields.io/npm/v/@datagutt/kanpla.svg)](https://www.npmjs.com/package/@datagutt/kanpla)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

An unofficial Node.js API client for the Kanpla cantina app. Access menu information programmatically with TypeScript support.

> ⚠️ **Disclaimer**: This is an unofficial client. Use at your own risk.

## Installation

```bash
npm install @datagutt/kanpla
```

```bash
pnpm add @datagutt/kanpla
```

```bash
yarn add @datagutt/kanpla
```

```bash
bun add @datagutt/kanpla
```

## Quick Start

```typescript
import Kanpla from '@datagutt/kanpla';

const kanpla = new Kanpla({
  FIREBASE_API_KEY: 'your-firebase-api-key',
  FIREBASE_USERNAME: 'your-username',
  FIREBASE_PASSWORD: 'your-password',
  MODULE_ID: 'your-module-id',
  LANGUAGE: 'nb',
});

const menu = await kanpla.getMenusForToday();
console.log(menu);
```

## Configuration

### Environment Variables

Create a `.env` file in your project root:

```env
FIREBASE_API_KEY=your-firebase-api-key
FIREBASE_USERNAME=your-username
FIREBASE_PASSWORD=your-password
MODULE_ID=your-module-id
```

### Options

| Option              | Type   | Required | Default | Description                            |
| ------------------- | ------ | -------- | ------- | -------------------------------------- |
| `FIREBASE_API_KEY`  | string | Yes      | -       | Firebase API key for authentication    |
| `FIREBASE_USERNAME` | string | Yes      | -       | Your Kanpla account username           |
| `FIREBASE_PASSWORD` | string | Yes      | -       | Your Kanpla account password           |
| `MODULE_ID`         | string | Yes      | -       | The module/location ID for the cantina |
| `LANGUAGE`          | string | No       | `'en'`  | Language code (e.g., `'nb'`, `'en'`)   |
| `API_BASE_URL`      | string | No       | -       | Custom API base URL (optional)         |

## API Methods

### `getMenusForToday()`

Fetch today's available menus.

```typescript
const todaysMenus = await kanpla.getMenusForToday();
```

**Returns**: `Promise<MenuData[] | null>`

### `getMenusForDate(date: Date)`

Fetch menus for a specific date.

```typescript
const date = new Date('2025-10-15');
const menus = await kanpla.getMenusForDate(date);
```

**Returns**: `Promise<MenuData[] | null>`

### `getAllMenus()`

Fetch all available menus.

```typescript
const allMenus = await kanpla.getAllMenus();
```

**Returns**: `Promise<any[] | null>`

### `getFrontend()`

Get raw frontend data from the Kanpla API.

```typescript
const frontendData = await kanpla.getFrontend();
```

**Returns**: `Promise<any>`

### `forceRefreshToken()`

Manually refresh the authentication token.

```typescript
await kanpla.forceRefreshToken();
```

**Returns**: `Promise<boolean>`

## TypeScript Support

This package is written in TypeScript and includes type definitions.

### MenuData Type

```typescript
type MenuData = {
  available: boolean;
  menu: {
    productId: string;
    moduleId: string;
    dateSeconds: number;
    pictograms: Record<string, unknown>;
    name: string;
    labels: Record<string, unknown>;
    allergens: Record<string, boolean>;
    description: string;
  };
};
```

## Example Usage

```typescript
import Kanpla from '@datagutt/kanpla';
import dotenv from 'dotenv';

dotenv.config();

const kanpla = new Kanpla({
  FIREBASE_API_KEY: process.env.FIREBASE_API_KEY as string,
  FIREBASE_USERNAME: process.env.FIREBASE_USERNAME as string,
  FIREBASE_PASSWORD: process.env.FIREBASE_PASSWORD as string,
  MODULE_ID: process.env.MODULE_ID as string,
  LANGUAGE: 'nb',
});

async function main() {
  const todaysMenu = await kanpla.getMenusForToday();

  if (todaysMenu) {
    todaysMenu.forEach((item) => {
      console.log(`${item.menu.name}: ${item.menu.description}`);
      console.log(`Allergens:`, item.menu.allergens);
      console.log('---');
    });
  }

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowsMenu = await kanpla.getMenusForDate(tomorrow);
  console.log('Tomorrow:', tomorrowsMenu);
}

main();
```

## License

MIT © [Thomas Lekanger](https://github.com/datagutt)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

If you encounter any issues or have questions, please [open an issue](https://github.com/datagutt/kanpla/issues) on GitHub.
