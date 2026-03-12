// Deploys an Azure Static Web App (Free tier) to host the React UI.
// The app includes pages like CompressedCalendar, Fishy, FlappyBird, and more.
param location string = resourceGroup().location
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
