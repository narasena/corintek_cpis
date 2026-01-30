export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">
          CPIS - Corintek Project Information System
        </h1>
        <p className="text-xl text-muted-foreground mb-8">Welcome to the MVP</p>
        <div className="flex gap-4 justify-center">
          <a
            href="/test/users"
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Test User CRUD →
          </a>
        </div>
      </div>
    </div>
  );
}
