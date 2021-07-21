import { lazyValue } from '@proc7ts/primitives';
import Order from '@sqdn/order';
import { createRequire } from 'module';
import { fileURLToPath, pathToFileURL } from 'url';
import { createContext, Module, SyntheticModule } from 'vm';
import { Formation } from '../formation';
import { Formation$Factory } from './formation.factory';
import { Formation$Host } from './formation.host';
import { VMModuleSource } from './vm-module-source';

export class VMLoader {

  private readonly _host: Formation$Host;
  private readonly _resolve: RequireResolve;
  private readonly _vmContext: () => object;
  private readonly _cache = new Map<string, VMModuleSource>();
  private readonly _order: () => Order;
  private readonly _orderModule: () => Promise<Module>;

  constructor(
      readonly rootURL: string,
      formationFactory: Formation$Factory,
  ) {
    this._host = new Formation$Host(formationFactory);
    this._resolve = createRequire(rootURL).resolve;
    this._vmContext = lazyValue(() => createContext(
        {},
        {
          name: `${this.formation} VM Context`,
        },
    ));
    this._order = lazyValue(() => this._host.newOrderBuilder(this.formation.uid).context);
    this._orderModule = lazyValue(() => {

      const module = new SyntheticModule(
          ['*default*'],
          () => {
            module.setExport('*default*', this.order);
          },
          {
            identifier: '@sqdn/order',
            context: this.vmContext,
          },
      );

      return module.link(this.resolveModule.bind(this));
    });
  }

  get formation(): Formation {
    return this._host.formation;
  }

  get order(): Order {
    return this._order();
  }

  get vmContext(): object {
    return this._vmContext();
  }

  async resolveModule(specifier: string, referencingModule: Module): Promise<Module> {
    if (specifier === '@sqdn/order') {
      return this._orderModule();
    }
    return await (this.moduleByURL(this.moduleURL(specifier, referencingModule))).module;
  }

  private moduleURL(specifier: string, referencingModule: Module): URL {

    const referrer = this.moduleByURL(this.moduleIdToURL(referencingModule.identifier), specifier);

    return pathToFileURL(this._resolve(specifier, { paths: [fileURLToPath(referrer.sourceURL.href)] }));
  }

  private moduleIdToURL(specifier: string): URL {
    if (specifier.indexOf(':') > 0 && !specifier.startsWith('node:')) {
      // Absolute URL.
      return new URL(specifier);
    }

    // Module specifier.
    return pathToFileURL(this._resolve(specifier));
  }

  private moduleByURL(sourceURL: URL, specifier?: string): VMModuleSource {

    const href = sourceURL.href;
    const cached = this._cache.get(href);

    if (cached) {
      return cached;
    }

    const newModule = new VMModuleSource(this, sourceURL, specifier);

    this._cache.set(href, newModule);

    return newModule;
  }

}
