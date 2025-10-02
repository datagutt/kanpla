import { ApiWrapper } from './api-wrapper.js';
import { findDateInArray } from './utils.js';

type KanplaOptions = {
  FIREBASE_API_KEY: string;
  FIREBASE_USERNAME: string;
  FIREBASE_PASSWORD: string;
  API_BASE_URL?: string;
  MODULE_ID: string;
  LANGUAGE?: string;
};

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

export class Kanpla {
  private apiWrapper: ApiWrapper;
  private options: KanplaOptions;
  constructor(options: KanplaOptions) {
    this.apiWrapper = new ApiWrapper({
      FIREBASE_API_KEY: options.FIREBASE_API_KEY,
      FIREBASE_USERNAME: options.FIREBASE_USERNAME,
      FIREBASE_PASSWORD: options.FIREBASE_PASSWORD,
      API_BASE_URL: options.API_BASE_URL,
    });
    // default options merge
    this.options = {
      LANGUAGE: 'en',
      ...options,
    };
  }

  async forceRefreshToken(): Promise<boolean> {
    return Boolean(await this.apiWrapper.getTokenDirectly());
  }

  async getFrontend() {
    await this.apiWrapper.getPortalToken();
    const userId = this.apiWrapper.getUserId();
    const { data } = await this.apiWrapper.makeApiCall({
      path: 'load/frontend',
      method: 'POST',
      data: {
        userId,
        url: 'app',
        language: this.options.LANGUAGE,
      },
    });

    return data;
  }

  async getAllMenus() {
    const data = await this.getFrontend();
    if (!data?.offers) {
      console.log('no offers');
      return null;
    }
    if (!Object.keys(data.offers).includes(this.options.MODULE_ID)) {
      console.log('module id not found in offers', this.options.MODULE_ID);
      return null;
    }
    return data?.offers?.[this.options.MODULE_ID]?.items;
  }

  async getMenusForDate(menuDate: Date): Promise<MenuData[] | null> {
    const data = await this.getAllMenus();
    if (!data) {
      return null;
    }
    const todaysMenus = data.map((menu: { dates?: string[] }) => {
      const date = findDateInArray(
        Object.keys(menu?.dates ?? []).map(Number),
        menuDate,
      );
      if (!date) {
        return null;
      }
      return menu?.dates?.[date];
    }) as MenuData[];
    return todaysMenus.filter((menu) => menu !== null && menu.available);
  }

  async getMenusForToday(): Promise<MenuData[] | null> {
    return this.getMenusForDate(new Date());
  }
}
