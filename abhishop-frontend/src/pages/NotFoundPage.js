import { Link } from 'react-router-dom';

function NotFoundPage() {
  return (
    <div className="flex-center page-wrapper" style={{ flexDirection: 'column', gap: '20px', textAlign: 'center' }}>
      <div style={{ fontSize: '80px' }}>🔍</div>
      <h1 style={{ fontSize: '32px', fontWeight: '800' }}>404</h1>
      <h2 style={{ fontSize: '22px' }}>Page Not Found</h2>
      <p className="text-muted">Sorry, the page you are looking for doesn't exist.</p>
      <Link to="/" className="btn btn-primary btn-lg">Go Back Home</Link>
    </div>
  );
}

export default NotFoundPage;
