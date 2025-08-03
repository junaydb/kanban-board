import * as React from "react";
import Home from "./Home";
import Footer from "./components/Footer";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

function App() {
  return (
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <div className="min-h-screen bg-background flex flex-col">
          <main className="container mx-auto px-4 py-8 flex-1">
            <Home />
          </main>
          <Footer />
        </div>
      </QueryClientProvider>
    </React.StrictMode>
  );
}

export default App;
