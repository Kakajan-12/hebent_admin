import Sidebar from "@/Components/Sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex">
      <div className="w-72 flex-shrink-0">
        <Sidebar />
      </div>
      <div className="flex-1 min-h-screen p-10">{children}</div>
    </div>
  );
}
