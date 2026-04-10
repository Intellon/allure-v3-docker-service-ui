import React from 'react';
import { createRoot } from 'react-dom/client';
import { StyledEngineProvider } from '@mui/material/styles';
import App from './App';
import './index.css';

const root = createRoot(document.getElementById('root'));
root.render(
  React.createElement(
    StyledEngineProvider,
    { injectFirst: true },
    React.createElement(App)
  )
);
