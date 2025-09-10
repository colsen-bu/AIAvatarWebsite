// Ensures /api/health is lightweight if accessed expecting HTML
export default function Head() {
  return (
    <>
      <meta name="robots" content="noindex" />
    </>
  );
}
