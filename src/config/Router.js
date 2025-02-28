import React from "react";
import {Routes, Route} from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";

import AppPage from "../pages/AppPage";
import Contact from "../pages/Contact";
import About from "../pages/About";
import { NotFound } from "../components/NotFound";

const Pages = () => (
    <Routes>
        <Route exact path="/" element={<ProtectedRoute><AppPage /></ProtectedRoute>} />
        {/* ProtectedRoute sarmalı login, yetki vb durumlar için eklendi */}
        {/*<Route path="/login" element={<Login />}*/}
        <Route path="/about" element={<ProtectedRoute><About /></ProtectedRoute>} />
        <Route path="/contact" element={<ProtectedRoute><Contact /></ProtectedRoute>} />
        <Route path="*" element={<ProtectedRoute><NotFound /></ProtectedRoute>} />
    </Routes>
)

export { Pages };