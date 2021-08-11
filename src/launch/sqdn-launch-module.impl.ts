import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';
import { Module, SourceTextModule } from 'vm';
import { SqdnLauncher } from './sqdn-launcher';

export class SqdnLaunchModule {

  #getModule: () => Promise<Module>;
  readonly id: string;

  constructor(
      readonly resolver: SqdnLauncher,
      readonly sourceURL: URL,
      specifier?: string,
  ) {
    this.#getModule = () => {

      const promise = this.#readSource().then(src => this.#createModule(src));

      this.#getModule = () => promise;

      return promise;
    };
    this.id = !specifier || specifier.startsWith('.') ? sourceURL.href : specifier;
  }

  get module(): Promise<Module> {
    return this.#getModule();
  }

  async #readSource(): Promise<string> {
    return await fs.readFile(
        fileURLToPath(this.sourceURL.href),
        { encoding: 'utf8' },
    );
  }

  async #createModule(source: string): Promise<Module> {

    const module = new SourceTextModule(
        source,
        {
          identifier: this.id,
          context: this.resolver.vmContext,
        },
    );

    await module.link(this.resolver.resolveModule.bind(this.resolver));

    return module;
  }

}
