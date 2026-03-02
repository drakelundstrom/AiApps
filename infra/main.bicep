// NOTE:
// You asked to keep the same params. Static Web Apps doesn’t use an App Service Plan,
// so `appServicePlanName` is kept only for backward compatibility and is unused.

param location string = resourceGroup().location
param appServicePlanName string
param webAppName string

resource staticWebApp 'Microsoft.Web/staticSites@2024-04-01' = {
  name: webAppName
  location: location
  sku: {
    name: 'Free'
    tier: 'Free'
  }
  properties: {}
}

// Handy outputs
output staticWebAppDefaultHostname string = staticWebApp.properties.defaultHostname

// This returns the SWA deployment token (what you use in GitHub Actions as AZURE_STATIC_WEB_APPS_API_TOKEN)
output staticWebAppDeploymentToken string = listSecrets(staticWebApp.id, staticWebApp.apiVersion).properties.apiKey
