const express = require('express');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerDoc = YAML.load('./docs.yaml');

const app = express();
const PORT = process.env.PORT || 8000;
const authRoutes = require('./routes/auth');
const notesRoutes = require('./routes/notes');
const authenticate = require('./middleware/authenticate');

// Middleware
app.use(express.json());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc));
app.use('/api', authRoutes);
app.use('/api', notesRoutes);

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
