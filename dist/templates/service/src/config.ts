import { Cfg } from '@anyit/cfg';

export const Config = Cfg.set({
  app: {
    port: {
      default: 3000,
      type: 'integer',
    },
    environment: {
      default: 'development',
      type: 'string',
    }
  },
});
