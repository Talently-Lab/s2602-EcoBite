import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-background px-6 py-16 text-foreground">
      <div className="flex max-w-lg flex-col items-center text-center">
        <p className="text-sm font-medium text-muted-foreground">Error 404</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-5xl">
          Página no encontrada
        </h1>
        <p className="mt-4 text-base text-muted-foreground">
          La ruta que buscas no existe o fue movida.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button render={<Link to="/" />}>Volver al inicio</Button>
          <Button variant="outline" render={<Link to="/dashboard" />}>
            Ir al dashboard
          </Button>
        </div>
      </div>
    </main>
  );
}

export default NotFound;
