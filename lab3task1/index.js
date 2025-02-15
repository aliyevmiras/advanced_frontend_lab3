const express = require('express');
const path = require('path');
const app = express();
var expressLayouts=require("express-ejs-layouts");
app.use(expressLayouts);


const PORT = process.env.PORT || 3000;

// Set up EJS as the view engine
app.set('view engine', 'ejs');
app.set('layout', 'layout/main')
app.set('views', path.join(__dirname, 'views'));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.get('/', (req, res) => {
  res.render('pages/index', { 
    title: 'Практическая работа 3',
    pageContent: 'Welcome to the website'
  });
});

app.get('/assignment-1', (req, res) => {
  res.render('pages/assignment-1', { 
    title: 'Interactive visualization',
    pageContent: 'Interactive visualization with D3.js'
  });
});

app.get('/assignment-2', (req, res) => {
  res.render('pages/assignment-2', { 
    title: '3D application',
    pageContent: '3D application with React Three Fiber'
  });
});

app.get('/assignment-3', (req, res) => {
  res.render('pages/assignment-3', { 
    title: 'PWA',
    pageContent: 'PWA using Service Workers'
  });
});



// Start server
app.listen(3000, () => {
  console.log(`Server running on http://localhost:${3000}`);
});