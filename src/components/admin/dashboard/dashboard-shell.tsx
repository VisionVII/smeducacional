interface DashboardShellProps {
  children: React.ReactNode;
}

export function DashboardShell({ children }: DashboardShellProps) {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-6 lg:p-8 pt-6 max-w-[1600px] mx-auto w-full">
      {children}
    </div>
  );
}
