import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { lazy, Suspense } from "react";
import { ArrowRight } from "lucide-react";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { SiteFrame, SiteProvider } from "./components/SiteChrome";
const Audit = lazy(() => import("./pages/Audit"));
const Home = lazy(() => import("./pages/Home"));
const Menu = lazy(() => import("./pages/Menu"));

function NotFoundPage() {
  return (
    <SiteFrame>
      <main className="page-wrap narrow-page not-found-page">
        <span className="eyebrow">A small detour</span>
        <h1>That page isn’t here.</h1>
        <p>Take a breath, then head back to the beginning.</p>
        <a className="button button-primary" href="/">Back to DopaTrack <ArrowRight size={15} /></a>
      </main>
    </SiteFrame>
  );
}

function Router() {
  return (
    <Suspense fallback={<div className="page-wrap narrow-page not-found-page" role="status">Taking a little breath…</div>}>
      <Switch>
        <Route path={"/"} component={Home} />
        <Route path={"/menu"} component={Menu} />
        <Route path={"/audit"} component={Audit} />
        {/* Final fallback route */}
        <Route component={NotFoundPage} />
      </Switch>
    </Suspense>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <SiteProvider>
            <Router />
          </SiteProvider>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
