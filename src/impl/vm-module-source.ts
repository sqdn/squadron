import { valueProvider } from '@proc7ts/primitives';
import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';
import { Module, SourceTextModule } from 'vm';
import { VMLoader } from './vm-loader';

export class VMModuleSource {

  private _getModule: () => Promise<Module>;
  readonly id: string;

  constructor(
      readonly loader: VMLoader,
      readonly sourceURL: URL,
      specifier?: string,
  ) {
    this._getModule = () => {

      const promise = this.readSource().then(src => this.createModule(src));

      this._getModule = valueProvider(promise);

      return promise;
    };
    this.id = !specifier || specifier.startsWith('.') ? sourceURL.href : specifier;
  }

  get active(): true {
    return true;
  }

  get module(): Promise<Module> {
    return this._getModule();
  }

  private async readSource(): Promise<string> {
    return await fs.readFile(
        fileURLToPath(this.sourceURL.href),
        { encoding: 'utf8' },
    );
  }

  private async createModule(source: string): Promise<Module> {

    const module = new SourceTextModule(
        source,
        {
          identifier: this.id,
          context: this.loader.vmContext,
        },
    );

    return await module.link(this.loader.resolveModule.bind(this.loader));
  }

}
