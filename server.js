const express = require('express');
const sql = require('mssql'); // Import mssql
const path = require('path');

const app = express();
const port = 3000;

app.use(express.json()); // Middleware to parse JSON request bodies

// Middleware para permitir CORS (necesario para que el frontend acceda al backend)
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*'); // Permite acceso desde cualquier origen
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE'); // Permitir estos métodos
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

// SQL Server connection configuration
const config = {
    user: 'sa',
    password: 'esea',
    server: 'PC-CASA\\SQLEXPRESS', // You may need to escape backslashes if this is a string literal in some contexts, but for direct use here it should be fine.
    database: 'DashBoard',
    options: {
        encrypt: false, // For Azure SQL Database, set to true
        trustServerCertificate: true // Change to true for local dev / self-signed certs
    },
    port: 1433
};

// Connect to SQL Server and initialize database
async function connectAndInitializeDb() {
    try {
        await sql.connect(config);
        console.log('Conectado a la base de datos SQL Server.');

        // Create metrics table if not exists
        const createMetricsTableQuery = `
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='metrics' and xtype='U')
            CREATE TABLE metrics (
                id INT IDENTITY(1,1) PRIMARY KEY,
                name NVARCHAR(255) NOT NULL,
                value INT NOT NULL
            );
        `;
        await sql.query(createMetricsTableQuery);
        console.log('Tabla metrics verificada/creada.');

        // Always insert sample data for metrics (clearing existing first)
        const request = new sql.Request();
        await request.query`DELETE FROM metrics`; // Clear existing data
        await request.query`INSERT INTO metrics (name, value) VALUES ('Usuarios Activos', 1200)`;
        await request.query`INSERT INTO metrics (name, value) VALUES ('Ventas Hoy', 450)`;
        await request.query`INSERT INTO metrics (name, value) VALUES ('Visitas Página', 8900)`;
        await request.query`INSERT INTO metrics (name, value) VALUES ('Facturación Total', 140000)`;
        console.log('Datos de ejemplo de metrics insertados/actualizados.');


        // Create products table if not exists
        const createProductsTableQuery = `
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='products' and xtype='U')
            CREATE TABLE products (
                id INT IDENTITY(1,1) PRIMARY KEY,
                name NVARCHAR(255) NOT NULL,
                description NVARCHAR(MAX),
                price DECIMAL(10, 2) NOT NULL,
                stock INT NOT NULL DEFAULT 0
            );
        `;
        await sql.query(createProductsTableQuery);
        console.log('Tabla products verificada/creada.');

        // Insert sample data for products only if the table is empty
        const countProductsResult = await sql.query`SELECT COUNT(*) AS count FROM products`;
        if (countProductsResult.recordset[0].count === 0) {
            const requestProducts = new sql.Request(); // Use a new request object
            await requestProducts.query`INSERT INTO products (name, description, price, stock) VALUES ('Laptop Gamer', 'Potente laptop para juegos', 1200.00, 50)`;
            await requestProducts.query`INSERT INTO products (name, description, price, stock) VALUES ('Teclado Mecánico', 'Teclado RGB con switches azules', 75.50, 200)`;
            await requestProducts.query`INSERT INTO products (name, description, price, stock) VALUES ('Mouse Inalámbrico', 'Mouse ergonómico con alta precisión', 30.00, 300)`;
            console.log('Datos de ejemplo insertados en la tabla products.');
        } else {
            console.log('La tabla products ya contiene datos.');
        }

        // Create customers table if not exists
        const createCustomersTableQuery = `
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='customers' and xtype='U')
            CREATE TABLE customers (
                id INT IDENTITY(1,1) PRIMARY KEY,
                name NVARCHAR(255) NOT NULL,
                email NVARCHAR(255) UNIQUE,
                phone NVARCHAR(50),
                address NVARCHAR(MAX)
            );
        `;
        await sql.query(createCustomersTableQuery);
        console.log('Tabla customers verificada/creada.');

        // Insert sample data for customers only if the table is empty
        const countCustomersResult = await sql.query`SELECT COUNT(*) AS count FROM customers`;
        if (countCustomersResult.recordset[0].count === 0) {
            const requestCustomers = new sql.Request(); // Use a new request object
            await requestCustomers.query`INSERT INTO customers (name, email, phone, address) VALUES ('Juan Pérez', 'juan.perez@example.com', '123-456-7890', 'Calle Falsa 123, Ciudad')`;
            await requestCustomers.query`INSERT INTO customers (name, email, phone, address) VALUES ('María García', 'maria.garcia@example.com', '987-654-3210', 'Avenida Siempre Viva 456, Pueblo')`;
            console.log('Datos de ejemplo insertados en la tabla customers.');
        } else {
            console.log('La tabla customers ya contiene datos.');
        }

        // Create orders table if not exists
        const createOrdersTableQuery = `
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='orders' and xtype='U')
            CREATE TABLE orders (
                id INT IDENTITY(1,1) PRIMARY KEY,
                customer_id INT NOT NULL,
                order_date DATETIME DEFAULT GETDATE(),
                total_amount DECIMAL(10, 2) NOT NULL,
                status NVARCHAR(50) DEFAULT 'Pendiente',
                FOREIGN KEY (customer_id) REFERENCES customers(id)
            );
        `;
        await sql.query(createOrdersTableQuery);
        console.log('Tabla orders verificada/creada.');

        // Insert sample data for orders only if the table is empty
        const countOrdersResult = await sql.query`SELECT COUNT(*) AS count FROM orders`;
        if (countOrdersResult.recordset[0].count === 0) {
            const requestOrders = new sql.Request(); // Use a new request object
            // Assuming customer with id 1 and 2 exist from previous inserts
            await requestOrders.query`INSERT INTO orders (customer_id, total_amount, status) VALUES (1, 1275.50, 'Completado')`;
            await requestOrders.query`INSERT INTO orders (customer_id, total_amount, status) VALUES (2, 30.00, 'Pendiente')`;
            console.log('Datos de ejemplo insertados en la tabla orders.');
        } else {
            console.log('La tabla orders ya contiene datos.');
        }

    } catch (err) {
        console.error('Error al conectar o inicializar la base de datos:', err.message);
    }
}

connectAndInitializeDb(); // Call the async function

// Endpoint para obtener métricas
app.get('/api/metrics', async (req, res) => {
    try {
        const result = await sql.query`SELECT * FROM metrics`;
        res.json({ metrics: result.recordset });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Iniciar el servidor
app.listen(port, () => {
    console.log(`Servidor backend escuchando en http://localhost:${port}`);
});

// Handle graceful shutdown
process.on('SIGINT', async () => {
    await sql.close();
    console.log('Conexión a SQL Server cerrada.');
    process.exit(0);
});

// --- Endpoints de Productos ---
app.get('/api/products', async (req, res) => {
    try {
        const result = await sql.query`SELECT * FROM products`;
        res.json({ products: result.recordset });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/products', async (req, res) => {
    try {
        const { name, description, price, stock } = req.body;
        if (!name || !price || !stock) {
            return res.status(400).json({ error: 'Name, price, and stock are required.' });
        }

        const request = new sql.Request();
        request.input('name', sql.NVarChar, name);
        request.input('description', sql.NVarChar, description);
        request.input('price', sql.Decimal(10, 2), price);
        request.input('stock', sql.Int, stock);

        const result = await request.query`
            INSERT INTO products (name, description, price, stock)
            VALUES (@name, @description, @price, @stock);
            SELECT SCOPE_IDENTITY() AS id;
        `;

        const newProductId = result.recordset[0].id;
        res.status(201).json({ message: 'Producto creado exitosamente', id: newProductId, name, description, price, stock });

    } catch (err) {
        console.error('Error al crear producto:', err.message);
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/products/:id', async (req, res) => {
    try {
        const productId = req.params.id;
        const { name, description, price, stock } = req.body;

        if (!name || !price || !stock) {
            return res.status(400).json({ error: 'Name, price, and stock are required.' });
        }

        const request = new sql.Request();
        request.input('id', sql.Int, productId);
        request.input('name', sql.NVarChar, name);
        request.input('description', sql.NVarChar, description);
        request.input('price', sql.Decimal(10, 2), price);
        request.input('stock', sql.Int, stock);

        const result = await request.query`
            UPDATE products
            SET name = @name, description = @description, price = @price, stock = @stock
            WHERE id = @id;
        `;

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ error: 'Producto no encontrado.' });
        }

        res.json({ message: 'Producto actualizado exitosamente.' });

    } catch (err) {
        console.error('Error al actualizar producto:', err.message);
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/products/:id', async (req, res) => {
    try {
        const productId = req.params.id;

        const request = new sql.Request();
        request.input('id', sql.Int, productId);

        const result = await request.query`
            DELETE FROM products WHERE id = @id;
        `;

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ error: 'Producto no encontrado.' });
        }

        res.json({ message: 'Producto eliminado exitosamente.' });

    } catch (err) {
        console.error('Error al eliminar producto:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// --- Endpoints de Clientes ---
app.get('/api/customers', async (req, res) => {
    try {
        const result = await sql.query`SELECT * FROM customers`;
        res.json({ customers: result.recordset });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/customers', async (req, res) => {
    try {
        const { name, email, phone, address } = req.body;
        if (!name) {
            return res.status(400).json({ error: 'Name is required.' });
        }

        const request = new sql.Request();
        request.input('name', sql.NVarChar, name);
        request.input('email', sql.NVarChar, email);
        request.input('phone', sql.NVarChar, phone);
        request.input('address', sql.NVarChar, address);

        const result = await request.query`
            INSERT INTO customers (name, email, phone, address)
            VALUES (@name, @email, @phone, @address);
            SELECT SCOPE_IDENTITY() AS id;
        `;

        const newCustomerId = result.recordset[0].id;
        res.status(201).json({ message: 'Cliente creado exitosamente', id: newCustomerId, name, email, phone, address });

    } catch (err) {
        console.error('Error al crear cliente:', err.message);
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/customers/:id', async (req, res) => {
    try {
        const customerId = req.params.id;
        const { name, email, phone, address } = req.body;

        if (!name) {
            return res.status(400).json({ error: 'Name is required.' });
        }

        const request = new sql.Request();
        request.input('id', sql.Int, customerId);
        request.input('name', sql.NVarChar, name);
        request.input('email', sql.NVarChar, email);
        request.input('phone', sql.NVarChar, phone);
        request.input('address', sql.NVarChar, address);

        const result = await request.query`
            UPDATE customers
            SET name = @name, email = @email, phone = @phone, address = @address
            WHERE id = @id;
        `;

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ error: 'Cliente no encontrado.' });
        }

        res.json({ message: 'Cliente actualizado exitosamente.' });

    } catch (err) {
        console.error('Error al actualizar cliente:', err.message);
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/customers/:id', async (req, res) => {
    try {
        const customerId = req.params.id;

        const request = new sql.Request();
        request.input('id', sql.Int, customerId);

        const result = await request.query`
            DELETE FROM customers WHERE id = @id;
        `;

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ error: 'Cliente no encontrado.' });
        }

        res.json({ message: 'Cliente eliminado exitosamente.' });

    } catch (err) {
        console.error('Error al eliminar cliente:', err.message);
        res.status(500).json({ error: err.message });
    }
});


// --- Endpoints de Pedidos ---
app.get('/api/orders', async (req, res) => {
    try {
        const result = await sql.query`SELECT * FROM orders`;
        res.json({ orders: result.recordset });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/orders', async (req, res) => {
    try {
        const { customer_id, total_amount, status } = req.body;
        if (!customer_id || !total_amount || !status) {
            return res.status(400).json({ error: 'customer_id, total_amount, and status are required.' });
        }

        const request = new sql.Request();
        request.input('customer_id', sql.Int, customer_id);
        request.input('total_amount', sql.Decimal(10, 2), total_amount);
        request.input('status', sql.NVarChar, status);

        const result = await request.query`
            INSERT INTO orders (customer_id, total_amount, status)
            VALUES (@customer_id, @total_amount, @status);
            SELECT SCOPE_IDENTITY() AS id;
        `;

        const newOrderId = result.recordset[0].id;
        res.status(201).json({ message: 'Pedido creado exitosamente', id: newOrderId, customer_id, total_amount, status });

    } catch (err) {
        console.error('Error al crear pedido:', err.message);
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/orders/:id', async (req, res) => {
    try {
        const orderId = req.params.id;
        const { customer_id, total_amount, status } = req.body;

        if (!customer_id || !total_amount || !status) {
            return res.status(400).json({ error: 'customer_id, total_amount, and status are required.' });
        }

        const request = new sql.Request();
        request.input('id', sql.Int, orderId);
        request.input('customer_id', sql.Int, customer_id);
        request.input('total_amount', sql.Decimal(10, 2), total_amount);
        request.input('status', sql.NVarChar, status);

        const result = await request.query`
            UPDATE orders
            SET customer_id = @customer_id, total_amount = @total_amount, status = @status
            WHERE id = @id;
        `;

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ error: 'Pedido no encontrado.' });
        }

        res.json({ message: 'Pedido actualizado exitosamente.' });

    } catch (err) {
        console.error('Error al actualizar pedido:', err.message);
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/orders/:id', async (req, res) => {
    try {
        const orderId = req.params.id;

        const request = new sql.Request();
        request.input('id', sql.Int, orderId);

        const result = await request.query`
            DELETE FROM orders WHERE id = @id;
        `;

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ error: 'Pedido no encontrado.' });
        }

        res.json({ message: 'Pedido eliminado exitosamente.' });

    } catch (err) {
        console.error('Error al eliminar pedido:', err.message);
        res.status(500).json({ error: err.message });
    }
});