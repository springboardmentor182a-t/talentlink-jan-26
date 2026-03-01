import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Messages from './messages/Messages';

export const ClientRoutes = () => {
  return (
    <Routes>
      <Route path="/messages" element={<Messages />} />
    </Routes>
  );
};

export default ClientRoutes;
