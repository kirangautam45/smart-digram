import APIProxy from '../asset/azure/APIProxy.svg';
import AppServiceEnvironments from '../asset/azure/AppServiceEnvironments.svg';
import AppServicePlans from '../asset/azure/AppServicePlans.svg';
import AppServices from '../asset/azure/AppServices.svg';
import AzureAppliedAIServices from '../asset/azure/AzureAppliedAIServices.svg';
import AzureCosmosDB from '../asset/azure/AzureCosmosDB.svg';
import AzureDatabaseMySQLServer from '../asset/azure/AzureDatabaseMySQLServer.svg';
import AzureFileshares from '../asset/azure/AzureFileshares.svg';
import AzureOpenAI from '../asset/azure/AzureOpenAI.svg';
import AzureSQLVM from '../asset/azure/AzureSQLVM.svg';
import Connections from '../asset/azure/Connections.svg';
import DataFactories from '../asset/azure/DataFactories.svg';
import DataLakeStorageGen1 from '../asset/azure/DataLakeStorageGen1.svg';
import EntraConnect from '../asset/azure/EntraConnect.svg';
import FireWalls from '../asset/azure/Firewalls.svg';
import KubernetesServices from '../asset/azure/KubernetesServices.svg';
import LocalNetworkGateways from '../asset/azure/LocalNetworkGateways.svg';
import LogAnalyticsWorkspaces from '../asset/azure/LogAnalyticsWorkspaces.svg';
import ManagedFileShares from '../asset/azure/ManagedFileShares.svg';
import NAT from '../asset/azure/NAT.svg';
import NetworkInterfaces from '../asset/azure/NetworkInterfaces.svg';
import NetworkSecurityGroups from '../asset/azure/NetworkSecurityGroups.svg';
import OnPremisesDataGateways from '../asset/azure/OnPremisesDataGateways.svg';
import OracleDatabase from '../asset/azure/OracleDatabase.svg';
import PublicIPAddresses from '../asset/azure/PublicIPAddresses.svg';
import RouteFilters from '../asset/azure/RouteFilters.svg';
import SQLDataWarehouses from '../asset/azure/SQLDataWarehouses.svg';
import SQLServer from '../asset/azure/SQLServer.svg';
import StorageAccounts from '../asset/azure/StorageAccounts.svg';
import StorageAzureFiles from '../asset/azure/StorageAzureFiles.svg';
import StorageContainer from '../asset/azure/StorageContainer.svg';
import StorageQueue from '../asset/azure/StorageQueue.svg';
import Table from '../asset/azure/Table.svg';
import Tags from '../asset/azure/Tags.svg';
import TenantProperties from '../asset/azure/TenantProperties.svg';
import VirtualNetworkGateways from '../asset/azure/VirtualNetworkGateways.svg';



const FallbackIcon = AppServices; 

export const serviceMappings = {
  // API Management
  'api-proxy': { icon: APIProxy },
  'apiproxy': { icon: APIProxy },
  'api-gateway': { icon: APIProxy },
  
  // App Services
  'app-service-environment': { icon: AppServiceEnvironments },
  'app-service-plan': { icon: AppServicePlans },
  'app-service': { icon: AppServices },
  'appservice': { icon: AppServices },
  'web-app': { icon: AppServices },
  
  // AI & Cognitive Services
  'applied-ai': { icon: AzureAppliedAIServices },
  'azure-ai': { icon: AzureAppliedAIServices },
  'cognitive-services': { icon: AzureAppliedAIServices },
  'openai': { icon: AzureOpenAI },
  'azure-openai': { icon: AzureOpenAI },
  
  // Databases
  'cosmosdb': { icon: AzureCosmosDB },
  'cosmos-db': { icon: AzureCosmosDB },
  'mysql': { icon: AzureDatabaseMySQLServer },
  'mysql-server': { icon: AzureDatabaseMySQLServer },
  'oracle': { icon: OracleDatabase },
  'oracle-database': { icon: OracleDatabase },
  'sql-server': { icon: SQLServer },
  'sqlserver': { icon: SQLServer },
  'sql-data-warehouse': { icon: SQLDataWarehouses },
  'data-warehouse': { icon: SQLDataWarehouses },
  'sql-vm': { icon: AzureSQLVM },
  'sql-virtual-machine': { icon: AzureSQLVM },
  
  // Storage
  'storage-account': { icon: StorageAccounts },
  'storage': { icon: StorageAccounts },
  'file-share': { icon: AzureFileshares },
  'azure-files': { icon: StorageAzureFiles },
  'storage-container': { icon: StorageContainer },
  'blob-container': { icon: StorageContainer },
  'storage-queue': { icon: StorageQueue },
  'queue': { icon: StorageQueue },
  'table': { icon: Table },
  'table-storage': { icon: Table },
  'data-lake': { icon: DataLakeStorageGen1 },
  'data-lake-storage': { icon: DataLakeStorageGen1 },
  'managed-file-share': { icon: ManagedFileShares },
  
  // Networking
  'connection': { icon: Connections },
  'vpn-connection': { icon: Connections },
  'firewall': { icon: FireWalls },
  'azure-firewall': { icon: FireWalls },
  'kubernetes': { icon: KubernetesServices },
  'aks': { icon: KubernetesServices },
  'local-network-gateway': { icon: LocalNetworkGateways },
  'nat': { icon: NAT },
  'nat-gateway': { icon: NAT },
  'network-interface': { icon: NetworkInterfaces },
  'nic': { icon: NetworkInterfaces },
  'network-security-group': { icon: NetworkSecurityGroups },
  'nsg': { icon: NetworkSecurityGroups },
  'public-ip': { icon: PublicIPAddresses },
  'public-ip-address': { icon: PublicIPAddresses },
  'route-filter': { icon: RouteFilters },
  'virtual-network-gateway': { icon: VirtualNetworkGateways },
  'vnet-gateway': { icon: VirtualNetworkGateways },
  
  // Data & Analytics
  'data-factory': { icon: DataFactories },
  'data-factories': { icon: DataFactories },
  'etl': { icon: DataFactories },
  
  // Identity & Management
  'entra-connect': { icon: EntraConnect },
  'active-directory': { icon: EntraConnect },
  'on-premises-gateway': { icon: OnPremisesDataGateways },
  'data-gateway': { icon: OnPremisesDataGateways },
  'tags': { icon: Tags },
  'tenant-properties': { icon: TenantProperties },
  
  // Monitoring
  'log-analytics': { icon: LogAnalyticsWorkspaces },
  'log-analytics-workspace': { icon: LogAnalyticsWorkspaces },
  'monitoring': { icon: LogAnalyticsWorkspaces },
};

// Detect service type and return icon
export const detectServiceType = (serviceType) => {
  if (!serviceType) {
    return {
      icon: FallbackIcon,
      provider: 'azure'
    };
  }

  const type = serviceType.toLowerCase().trim();
  
  // Find matching icon
  let icon = FallbackIcon;

  // Direct match
  if (serviceMappings[type]) {
    icon = serviceMappings[type].icon;
  } else {
    // Partial match
    const matchingKey = Object.keys(serviceMappings).find(key => 
      type.includes(key) || key.includes(type)
    );
    
    if (matchingKey) {
      icon = serviceMappings[matchingKey].icon;
    } else {
      // Try to find by common patterns
      if (type.includes('api') || type.includes('proxy') || type.includes('gateway')) {
        icon = APIProxy;
      } else if (type.includes('app') && type.includes('service')) {
        icon = AppServices;
      } else if (type.includes('database') || type.includes('db') || type.includes('sql')) {
        icon = SQLServer;
      } else if (type.includes('storage') || type.includes('blob') || type.includes('file')) {
        icon = StorageAccounts;
      } else if (type.includes('network') || type.includes('vnet') || type.includes('subnet')) {
        icon = NetworkInterfaces;
      } else if (type.includes('kubernetes') || type.includes('aks') || type.includes('container')) {
        icon = KubernetesServices;
      } else if (type.includes('firewall') || type.includes('security')) {
        icon = FireWalls;
      } else if (type.includes('ai') || type.includes('machine') || type.includes('learning')) {
        icon = AzureAppliedAIServices;
      }
    }
  }

  return {
    icon: icon || FallbackIcon,
    provider: 'azure'
  };
};

// Default export
export default {
  detectServiceType,
  serviceMappings
};


