import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import WorkDetails from "./pages/WorkDetails";
import VendorAnalysis from "./pages/VendorAnalysis";
import PublicView from "./pages/PublicView";
import NotFound from "./pages/NotFound";

export default function Router() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public citizen view — no sidebar */}
        <Route path="/public" element={<PublicView />} />

        {/* Audit tool — wrapped in sidebar layout */}
        <Route element={<AppLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="/works/:id" element={<WorkDetails />} />
          <Route path="/vendors/:id" element={<VendorAnalysis />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
