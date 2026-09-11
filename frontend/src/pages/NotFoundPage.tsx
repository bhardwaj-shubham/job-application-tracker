import { Link } from "react-router";
import { Button } from "@/components/ui/button";

const NotFoundPage = () => {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-4">
      <h1 className="text-4xl font-bold">404</h1>

      <p className="text-muted-foreground">
        The page you're looking for doesn't exist.
      </p>

      <Button>
        <Link to="/">Go to Homepage</Link>
      </Button>
    </main>
  );
};

export default NotFoundPage;
