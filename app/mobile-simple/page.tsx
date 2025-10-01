export default function MobileSimple() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f0f0f0', 
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{ 
        fontSize: '2rem', 
        color: '#333', 
        textAlign: 'center',
        marginBottom: '20px'
      }}>
        Mobile Test - Simple
      </h1>
      
      <div style={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '10px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        marginBottom: '20px'
      }}>
        <h2 style={{ color: '#666', marginBottom: '10px' }}>
          If you can see this, mobile is working!
        </h2>
        <p style={{ color: '#888', lineHeight: '1.5' }}>
          This is a very simple test page to check if mobile rendering is working.
          No JavaScript, no complex CSS, just basic HTML.
        </p>
      </div>

      <div style={{
        backgroundColor: '#e3f2fd',
        padding: '15px',
        borderRadius: '8px',
        border: '1px solid #2196f3'
      }}>
        <p style={{ color: '#1976d2', margin: 0, fontWeight: 'bold' }}>
          ✅ Mobile site is working correctly!
        </p>
      </div>
    </div>
  )
}
