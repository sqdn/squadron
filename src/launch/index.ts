/**
 * @packageDocumentation
 * @module @sqdn/squadron/launch
 */
export * from './sqdn-launcher';

declare module 'vm' {

  export abstract class Module {

    readonly identifier: string;

    readonly dependencySpecifiers: readonly string[];

    readonly namespace: object;

    readonly status: 'unlinked' | 'linking' | 'linked' | 'evaluating' | 'evaluated' | 'errored';

    link(linker: (specifier: string, referencingModule: Module) => Module | Promise<Module>): Promise<void>;

    evaluate(options?: { timeout?: number; breakOnSight?: boolean }): Promise<void>;

  }

  export class SourceTextModule extends Module {

    constructor(code: string, options?: SourceTextModuleOptions);

    createCachedData(): Buffer;

  }

  interface SourceTextModuleOptions {
    readonly identifier?: string | undefined;
    readonly cacheData?: Buffer | NodeJS.TypedArray | DataView | undefined;
    readonly context?: object | undefined;
    readonly lineOffset?: number | undefined;
    readonly columnOffset?: number | undefined;
    initializeImportMeta?(meta: unknown, module: SourceTextModule): void;
    importModuleDynamically?(
        specifier: string,
        module: Module,
    ): Module;
  }

  export class SyntheticModule extends Module {

    constructor(
        exportNames: readonly string[],
        evaluateCallback: (this: void) => void,
        options?: SyntheticModuleOptions,
    );

    setExport(name: string, value: unknown): void;

  }

  interface SyntheticModuleOptions {
    readonly identifier?: string | undefined;
    context?: object | undefined;
  }

}
