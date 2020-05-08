import { Logger } from './interfaces';
import { Store } from './store';

export type Config = 'dev' | 'test';

export class App {
  store: Store;

  constructor(config: Config, logger: Logger) {
    this.store = new Store();
  }
}
