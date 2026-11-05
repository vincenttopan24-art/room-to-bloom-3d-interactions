import React from 'react';
import {createRoot} from 'react-dom/client';
import {RoomToBloomDemo} from './RoomInteractions.jsx';
createRoot(document.getElementById('root')).render(<React.StrictMode><RoomToBloomDemo initialObject={new URLSearchParams(window.location.search).get('object')}/></React.StrictMode>);
