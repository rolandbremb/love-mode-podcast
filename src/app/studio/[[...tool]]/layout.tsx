export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <body>
        <div style={{ height: "100vh" }}>{children}</div>
      </body>
    </html>
  );
}
