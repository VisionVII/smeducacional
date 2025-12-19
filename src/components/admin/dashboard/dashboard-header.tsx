interface DashboardHeaderProps {
  heading: string;
  text?: string;
  children?: React.ReactNode;
}

export function DashboardHeader({
  heading,
  text,
  children,
}: DashboardHeaderProps) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between pb-2 md:pb-4">
      <div className="grid gap-1">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
          {heading}
        </h1>
        {text && (
          <p className="text-sm sm:text-base text-muted-foreground">{text}</p>
        )}
      </div>
      {children}
    </div>
  );
}
