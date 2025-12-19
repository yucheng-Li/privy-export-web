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
        <div style={styles.card}>
          <div style={styles.loadingContainer}>
            <div style={styles.loadingSpinner}></div>
            <p style={styles.loadingText}>Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  // Determine button text and disabled state
  const buttonText = !isAuthenticated ? 'Login' : 'Export my wallet'
  const isButtonDisabled = isAuthenticated && !hasEmbeddedWallet

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Export Keys</h2>
          
          <div style={styles.content}>
            {!isAuthenticated ? (
              <div style={styles.infoContainer}>
                <p style={styles.infoText}>
                  Please login to export your wallet keys.
                </p>
              </div>
            ) : !hasEmbeddedWallet ? (
              <div style={styles.infoContainer}>
                <p style={styles.infoText}>
                  No embedded wallet found. Please ensure you have an embedded wallet set up.
                </p>
              </div>
            ) : (
              <div style={styles.infoContainer}>
                <p style={styles.infoText}>
                  Export your wallet keys securely. This will allow you to backup and restore your wallet.
                </p>
              </div>
            )}

            <button 
              style={{
                ...styles.button,
                ...(isButtonDisabled ? styles.buttonDisabled : {}),
              }}
              onClick={handleExport}
              disabled={isButtonDisabled}
            >
              {buttonText}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
    minHeight: '100vh',
    width: '100%',        // ❗ 不要用 100vw
    backgroundColor: '#ffffff',
    margin: 0,
    padding: 0,
    boxSizing: 'border-box',
  },
  card: {
    width: 'calc(100% - 40px)', // 左右 20px
    margin: '20px',
    backgroundColor: '#ffffff',
    borderRadius: '20px',
    border: '1px solid #f1f5f9',
    boxShadow: '0px 4px 24px rgba(0, 0, 0, 0.102)',
    overflow: 'hidden',
    boxSizing: 'border-box',
  },
  section: {
    paddingTop: '20px',
    paddingBottom: '10px',
    paddingLeft: '20px',
    paddingRight: '20px',
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: 600,
    lineHeight: '26px',
    color: '#000000',
    marginBottom: '3px',
    margin: 0,
  },
  content: {
    paddingLeft: '1px',
    paddingRight: '6px',
    paddingTop: '14px',
    paddingBottom: '14px',
  },
  infoContainer: {
    marginBottom: '16px',
  },
  infoText: {
    fontSize: '12px',
    color: '#ACB3BE',
    marginTop: '4px',
    margin: 0,
    lineHeight: '16px',
  },
  button: {
    width: '100%',
    padding: '14px 24px',
    fontSize: '16px',
    fontWeight: 600,
    backgroundColor: '#000000',
    color: '#ffffff',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    transition: 'background-color 0.2s ease',
    marginTop: '8px',
  },
  buttonDisabled: {
    backgroundColor: '#E5E7EB',
    color: '#9CA3AF',
    cursor: 'not-allowed',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 20px',
  },
  loadingSpinner: {
    width: '40px',
    height: '40px',
    border: '3px solid #E5E7EB',
    borderTop: '3px solid #000000',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  loadingText: {
    marginTop: '12px',
    fontSize: '14px',
    color: '#6B7280',
    margin: 0,
  },
}

// Add spinner animation
const styleSheet = document.createElement('style')
styleSheet.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`
document.head.appendChild(styleSheet)

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
