import Order from '@sqdn/order';
import { createRequire } from 'module';
import { fileURLToPath, pathToFileURL } from 'url';
import { Module, SyntheticModule } from 'vm';
import { SqdnLaunchModule } from './sqdn-launch-module.impl';
import { SqdnLaunchOrder } from './sqdn-launch-order.impl';

export class SqdnLauncher {

  private readonly _resolve: RequireResolve;
  private readonly _cache = new Map<string, SqdnLaunchModule>();
  private _orderModule?: Promise<Module>;
  private _order = Order;

  constructor(readonly vmContext: object, readonly rootURL: string) {
    this._resolve = createRequire(rootURL).resolve;
  }

  get orderModule(): Promise<Module> {
    return this._orderModule ||= this.createOrderModule();
  }

  private async createOrderModule(): Promise<Module> {

    const order = this._order || new SqdnLaunchOrder(() => this._order);
    const module = new SyntheticModule(
        ['default'],
        () => {
          module.setExport('default', order);
        },
        {
          identifier: '@sqdn/order',
          context: this.vmContext,
        },
    );

    await module.link(this.resolveModule.bind(this));

    return module;
  }

  async launchModule(launchModuleId: string, options?: Parameters<Module['evaluate']>[0]): Promise<void> {

    const launchModule = await this.moduleByURL(this.moduleIdToURL(launchModuleId)).module;

    await launchModule.evaluate(options);

    const launch = (launchModule.namespace as Record<string, unknown>).default as (loader: SqdnLauncher) => void;

    return launch(this);
  }

  initOrder(order: Order): void {
    this._order = order;
  }

  async resolveModule(specifier: string, referencingModule: Module): Promise<Module> {
    if (specifier === '@sqdn/order') {
      return this.orderModule;
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
    return pathToFileURL(this._resolve(fileURLToPath(new URL(specifier, this.rootURL).href)));
  }

  private moduleByURL(sourceURL: URL, specifier?: string): SqdnLaunchModule {

    const href = sourceURL.href;
    const cached = this._cache.get(href);

    if (cached) {
      return cached;
    }

    const newModule = new SqdnLaunchModule(this, sourceURL, specifier);

    this._cache.set(href, newModule);

    return newModule;
  }

}
