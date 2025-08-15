export interface SystemInfo {
  userId: string;
  language: string;
  dataLanguage: string;
  connectionString: string;
  providerName: string;
  dataBaseVersion: string;
  additionalDataBaseInfo: {
    buildClrVersion: string;
    collation: string;
    edition: string;
    engineEdition: string;
    instanceName: string;
    isSingleUser: string;
    machineName: string;
    productVersion: string;
    serverName: string;
    sqlCharSetName: string;
    sqlSortOrderName: string;
  };
  dataSource: string;
  initialCatalog: string;
  hotfix: string;
  hotfixVersion: number;
  baseSystemHotfix: string;
  baseSystemHotfixVersion: number;
  fileVersion: string;
  applicationFolder: string;
  cadDestination: string;
  cachedAssetsFolder: string;
  cachedDataImportsFolder: string;
  fileCreationTimeUtc: string;
  serverUrl: string;
  dataSetup: number;
}
