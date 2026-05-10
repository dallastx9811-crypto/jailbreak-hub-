import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import Home from "@/pages/Home";
import ToolDetail from "@/pages/ToolDetail";
import { AuthProvider } from "@/context/AuthContext";

function App() {
    return (
        <AuthProvider>
            <div className="App">
                <BrowserRouter>
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/tool/:id" element={<ToolDetail />} />
                    </Routes>
                </BrowserRouter>
                <Toaster
                    theme="dark"
                    position="bottom-right"
                    toastOptions={{
                        style: {
                            background: "#0a0a0a",
                            border: "1px solid rgba(255,255,255,0.1)",
                            color: "#fff",
                            fontFamily: '"JetBrains Mono", monospace',
                            borderRadius: "2px",
                        },
                    }}
                />
            </div>
        </AuthProvider>
    );
}

export default App;
