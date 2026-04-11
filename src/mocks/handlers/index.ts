import { authHandlers } from './auth';
import { cartHandlers } from './cart';
import { checkoutHandlers } from './checkout';
import { orderHandlers } from './orders';
import { productHandlers } from './products';
import { settingsHandlers } from './settings';

export const handlers = [
  ...authHandlers,
  ...productHandlers,
  ...cartHandlers,
  ...checkoutHandlers,
  ...orderHandlers,
  ...settingsHandlers,
];
