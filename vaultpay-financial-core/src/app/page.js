import AuthGate from "@/components/AuthGate";
import RolePreview from "@/components/RolePreview";

export default function Home() {
  return (
    <AuthGate>
      <RolePreview />
    </AuthGate>
  );
}
