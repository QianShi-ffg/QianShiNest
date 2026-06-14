import { DEFAULT_MENU_ITEMS } from '../menu/menu-defaults';

export const USER_PERMISSION_OPTIONS = DEFAULT_MENU_ITEMS.map((item) => ({
  key: item.key,
  name: item.name,
}));

export const DEFAULT_USER_PERMISSIONS = USER_PERMISSION_OPTIONS.map(
  (item) => item.key,
);
