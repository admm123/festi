"use client";

type ErrorComponentProps = {
  error?: string;
};

export const ErrorComponent = ({ error }: ErrorComponentProps) => {
  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <div className="max-w-md">
        <h1 className="text-6xl font-semibold tracking-tight text-foreground">
          500
        </h1>

        <h2 className="mt-4 text-2xl font-medium text-foreground">
          Something went wrong
        </h2>

        <p className="mt-3 text-sm text-muted-foreground">
          {error || "An unexpected error occurred."}
        </p>
      </div>
    </main>
  );
};
