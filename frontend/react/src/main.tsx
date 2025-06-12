import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './auth/AuthProvider.tsx'
import './i18n';


createRoot(document.getElementById('root')!).render(
  <StrictMode>
	<AuthProvider>
		<Ap />
	</AuthProvider>
  </StrictMode>
)
