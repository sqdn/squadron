import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { Module } from 'node:vm';
import { isMainThread, moveMessagePortToContext, workerData } from 'node:worker_threads';
import { Formation$Host, Formation$LaunchData } from '../impl';
import { SqdnLaunchModule } from './sqdn-launch-module.impl';

export class SqdnLauncher {

  readonly #resolve: RequireResolve;
  readonly #cache = new Map<string, SqdnLaunchModule>();
  #launchData?: Formation$LaunchData | null | undefined = null;

  constructor(readonly vmContext: object, readonly rootURL: string) {
    this.#resolve = createRequire(rootURL).resolve;
  }

  get launchData(): Formation$LaunchData | undefined {
    if (this.#launchData !== null) {
      return this.#launchData;
    }
    if (isMainThread) {
      return this.#launchData = undefined;
    }

    const launchData = workerData as Formation$LaunchData;

    return this.#launchData = {
      ...launchData,
      hubPort: moveMessagePortToContext(launchData.hubPort, this.vmContext),
    };
  }

  async launchModule(launchModuleId: string, options?: Parameters<Module['evaluate']>[0]): Promise<void> {

    const launchModule = await this.#moduleByURL(this.#moduleIdToURL(launchModuleId)).module;

    await launchModule.evaluate(options);

    const launch = (launchModule.namespace as Record<string, unknown>).default as (loader: SqdnLauncher) => void;

    return launch(this);
  }

  initFormation(_host: Formation$Host): void {
    // Does nothing
  }

  async resolveModule(specifier: string, referencingModule: Module): Promise<Module> {
    return await (this.#moduleByURL(this.#moduleURL(specifier, referencingModule))).module;
  }

  #moduleURL(specifier: string, referencingModule: Module): URL {

    const referrer = this.#moduleByURL(this.#moduleIdToURL(referencingModule.identifier), specifier);

    return pathToFileURL(this.#resolve(specifier, { paths: [fileURLToPath(referrer.sourceURL.href)] }));
  }

  #moduleIdToURL(specifier: string): URL {
    if (
        specifier.startsWith('./')
        || specifier.startsWith('../')
        || specifier === '.'
        || specifier === '..') {
      // Relative URL.
      return pathToFileURL(this.#resolve(fileURLToPath(new URL(specifier, this.rootURL).href)));
    }

    // Absolute URL or module name.
    return pathToFileURL(this.#resolve(specifier));
  }

  #moduleByURL(sourceURL: URL, specifier?: string): SqdnLaunchModule {

    const href = sourceURL.href;
    const cached = this.#cache.get(href);

    if (cached) {
      return cached;
    }

    const newModule = new SqdnLaunchModule(this, sourceURL, specifier);

    this.#cache.set(href, newModule);

    return newModule;
  }

}
