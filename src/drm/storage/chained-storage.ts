import { License } from '../../license/license';
import { ILicenseStorage } from '../interfaces';
import { MisingLicenseError } from './errors/missing-license';
import { EnvStorage } from './env-storage';
import { FileStorage } from './file-storage';

export class ChainedStorage implements ILicenseStorage {
  /**
   * @param storages Chained storage implementations
   */
  constructor(public readonly storages: ILicenseStorage[]) {}

  /**
   * Loading first available license using the chained storage implementations
   *
   * @inheritdoc
   * @param ...args Arguments for every license storage implementation in chain, if any
   */
  public async load(...args: any[][]): Promise<License> {
    for (let i = 0; i < this.storages.length; i++) {
      try {
        return await this.storages[i].load(...(args[i] ?? []));
      } catch (e) {
        if (e instanceof MisingLicenseError) continue;
        throw e;
      }
    }

    throw new MisingLicenseError(
      `Unable to load licenses from none- ${this.storages
        .map(s => s.constructor.name)
        .join(', ')}`
    );
  }

  /**
   * Stores the license in the whole storage chain, returns true if ALL passed
   *
   * @todo Think of failing on single storage failure
   * @inheritdoc
   */
  public async store(license: License): Promise<boolean> {
    let result = true;

    for (let i = 0; i < this.storages.length; i++) {
      if ((await this.storages[i].store(license)) === false) {
        result = false;
      }
    }

    return result;
  }

  /**
   * Get a storage of certain implementation from the chain
   *
   * @param impl Function constructor to compare chain items to
   * @returns First instance having the implementation of type passed to the function
   */
  public storage<T extends ILicenseStorage>(
    // eslint-disable-next-line
    impl: Function
  ): T | undefined {
    return this.storages.filter(i => i instanceof impl).shift() as T;
  }

  /**
   * Creates a chained license storage with defaults: EnvStorage, FileStorage
   *
   * @param ...storages Storages to use
   */
  public static create(...storages: ILicenseStorage[]): ChainedStorage {
    return new ChainedStorage(
      storages.length <= 0 ? [new EnvStorage(), new FileStorage()] : storages
    );
  }
}
