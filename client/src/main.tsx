import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { Toaster } from 'react-hot-toast'
import { ErrorBoundary } from './components/ErrorBoundary'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from './components/queryClient'
import { AuthProvider } from 'react-oidc-context'

const oidcConfig = {
  authority: "https://auth-dev.snowse.io/realms/DevRealm/",
  client_id: "logan-chat",
  redirect_uri: "http://localhost:5173/",
}
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider {...oidcConfig}>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>,
)
