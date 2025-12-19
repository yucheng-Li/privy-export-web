import React from 'react'
import { PrivyProvider, usePrivy } from '@privy-io/react-auth'

function ExportWalletButton() {
  const { ready, authenticated, user, exportWallet, login } = usePrivy()

  // Check that your user is authenticated
  const isAuthenticated = ready && authenticated

  // Check that your user has an embedded wallet
  const hasEmbeddedWallet = !!user?.linkedAccounts?.find(
    (account) =>
      account.type === 'wallet' &&
      account.walletClientType === 'privy' &&
      account.chainType === 'ethereum'
  )
  console.log('hasEmbeddedWallet', hasEmbeddedWallet)
  console.log('user', JSON.stringify(user, null, 2))
  console.log('authenticated', authenticated)
  console.log('ready', ready)
  const handleExport = async () => {
    try {
      // Check if user is authenticated
      if (!isAuthenticated) {
        // Login first if not authenticated
        await login()
        return
      }

      // Export the wallet
      const walletData = await exportWallet()
      
      // Send to React Native WebView
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(
          JSON.stringify({
            type: 'export-wallet',
            walletData: walletData,
          })
        )
      } else {
        console.log('Wallet exported:', walletData)
        alert('Wallet exported! Check console. (Not in WebView)')
      }
    } catch (error) {
      console.error('Error exporting wallet:', error)
      
      // Check for 403 Forbidden error
      if (error.message?.includes('403') || error.message?.includes('Forbidden') || 
          error.toString().includes('403')) {
        const errorMsg = `403 Forbidden Error\n\n` +
          `This usually means:\n` +
          `1. Your domain (${window.location.origin}) is not whitelisted in Privy Dashboard\n` +
          `2. Email login method is not enabled in Privy Dashboard\n\n` +
          `Please check your Privy Dashboard settings.`
        alert(errorMsg)
      } else {
        alert('Error exporting wallet: ' + error.message)
      }
    }
  }

  if (!ready) {
    return (
      <div style={styles.container}>
        <div>Loading...</div>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <button 
        style={styles.button} 
        onClick={handleExport}
        disabled={!isAuthenticated || !hasEmbeddedWallet}
      >
        Export my wallet
      </button>
    </div>
  )
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    width: '100vw',
    backgroundColor: '#ffffff',
    margin: 0,
    padding: 0,
  },
  button: {
    padding: '12px 24px',
    fontSize: '16px',
    backgroundColor: '#0066ff',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
}

function App() {
  // Log current origin for debugging
  React.useEffect(() => {
    console.log('Current origin:', window.location.origin)
    console.log('Full URL:', window.location.href)
  }, [])

  return (
    <PrivyProvider
      appId={'cmb4ld7xg00qclg0n0ocxmp9l'}
      config={{
        loginMethods: ['email'],
        appearance: {
          theme: 'light',
        },
        embeddedWallets: {
          createOnLogin: 'users-without-wallets',
        },
      }}
    >
      <ExportWalletButton />
    </PrivyProvider>
  )
}

export default App
