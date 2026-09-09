/**
 * PageContainer — consistent max-width, padding wrapper for page content.
 */
export default function PageContainer({ children, style }) {
  return (
    <main className="page-container" style={style}>
      {children}
    </main>
  );
}
