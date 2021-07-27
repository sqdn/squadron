import Order from '@sqdn/order';
import { createRequire } from 'module';
import { fileURLToPath, pathToFileURL } from 'url';
import { Module, SyntheticModule } from 'vm';
import { isMainThread, moveMessagePortToContext, workerData } from 'worker_threads';
import { Formation$LaunchData } from '../impl';
import { SqdnLaunchModule } from './sqdn-launch-module.impl';
import { SqdnLaunchOrder } from './sqdn-launch-order.impl';

export class SqdnLauncher {

  private readonly _resolve: RequireResolve;
  private readonly _cache = new Map<string, SqdnLaunchModule>();
  private _order = Order;
  private _launchData?: Formation$LaunchData | null = null;
  private _orderModule?: Promise<Module>;

  constructor(readonly vmContext: object, readonly rootURL: string) {
    this._resolve = createRequire(rootURL).resolve;
  }

  get launchData(): Formation$LaunchData | undefined {
    if (this._launchData !== null) {
      return this._launchData;
    }
    if (isMainThread) {
      return this._launchData = undefined;
    }

    const launchData = workerData as Formation$LaunchData;

    return this._launchData = {
      ...launchData,
      hubPort: moveMessagePortToContext(launchData.hubPort, this.vmContext),
    };
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
    if (
        specifier.startsWith('./')
        || specifier.startsWith('../')
        || specifier === '.'
        || specifier === '..') {
      // Relative URL.
      return pathToFileURL(this._resolve(fileURLToPath(new URL(specifier, this.rootURL).href)));
    }

    // Absolute URL or module name.
    return pathToFileURL(this._resolve(specifier));
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
