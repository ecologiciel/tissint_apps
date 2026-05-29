import { AppProviders, RootStack } from "@/providers/app-providers";

export default function Layout() {
  return (
    <AppProviders>
      <RootStack />
    </AppProviders>
  );
}
