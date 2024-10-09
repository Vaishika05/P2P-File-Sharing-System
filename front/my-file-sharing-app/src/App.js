import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import FileUpload from "./components/FileUpload";
import Home from "./components/Home";

const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/upload" element={<FileUpload />} />
                <Route path="/home" element={<Home />} />
                {/* <Route path="*" element={<Navigate to="/login" />} /> Redirect any unknown routes */}
            </Routes>
        </Router>
    );
};

export default App;
