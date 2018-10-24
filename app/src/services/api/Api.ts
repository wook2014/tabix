import Connection, { isDirectConnection } from '../Connection';
import CoreProvider from './provider/CoreProvider';
import DirectClickHouseProvider from './provider/DirectClickHouseProvider';
import TabixServerProvider from './provider/TabixServerProvider';
import DataDecorator from './DataDecorator';
import { Query } from './Query';

export default class Api {
  static async connect(connection: Connection): Promise<Api> {
    const provider = isDirectConnection(connection)
      ? new DirectClickHouseProvider(connection)
      : new TabixServerProvider(connection);

    const version = await provider.fastGetVersion();
    if (!version) throw new Error('Can`t fetch version server');
    console.log(`Connection - OK, version: ${version}`);

    return new Api(provider, version);
  }

  private constructor(
    public readonly provider: CoreProvider<Connection>,
    public readonly version: string
  ) {}

  async fetch(query: Query) {
    const data = await this.provider.query(query);
    // , this.provider.getType()
    return new DataDecorator(data, query);
  }

  loadDatabaseStructure = async () => this.provider.getDatabaseStructure();
}
