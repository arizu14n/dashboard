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
                numero_pedido AS 'PED' + RIGHT('00000' + CAST(id AS VARCHAR(5)), 5) PERSISTED, -- Columna computada para el número de pedido
                customer_id INT NOT NULL,
                order_date DATETIME DEFAULT GETDATE(),
                total_amount DECIMAL(10, 2) NOT NULL,
                status NVARCHAR(50) DEFAULT 'Pendiente',
                forma_pago NVARCHAR(50) NOT NULL,
                FOREIGN KEY (customer_id) REFERENCES customers(id)
            );
        `;
        await sql.query(createOrdersTableQuery);
        console.log('Tabla orders verificada/creada.');

        // --- Parche para actualizar la tabla orders si ya existía ---
        const checkOrderColumnsQuery = `
            IF NOT EXISTS (SELECT * FROM sys.columns WHERE Name = N'forma_pago' AND Object_ID = Object_ID(N'orders'))
            BEGIN
                ALTER TABLE orders ADD forma_pago NVARCHAR(50) NOT NULL DEFAULT 'Contado';
            END

            IF NOT EXISTS (SELECT * FROM sys.computed_columns WHERE Name = N'numero_pedido' AND object_id = OBJECT_ID(N'orders'))
            BEGIN
                ALTER TABLE orders ADD numero_pedido AS 'PED' + RIGHT('00000' + CAST(id AS VARCHAR(5)), 5) PERSISTED;
            END
        `;
        await sql.query(checkOrderColumnsQuery);
        console.log('Columnas de la tabla orders verificadas/parcheadas.');
        // --- Fin del parche ---

        // --- Parche para corregir Foreign Keys con borrado en cascada incorrecto ---
        const fixConstraintsQuery = `
            -- 1. Corregir FK de orders a customers (NO DEBE SER CASCADE)
            DECLARE @fk_orders_customers_name NVARCHAR(128);
            SELECT @fk_orders_customers_name = fk.name
            FROM sys.foreign_keys fk
            WHERE fk.parent_object_id = OBJECT_ID('orders') AND fk.referenced_object_id = OBJECT_ID('customers');

            IF @fk_orders_customers_name IS NOT NULL
            BEGIN
                EXEC('ALTER TABLE orders DROP CONSTRAINT ' + @fk_orders_customers_name);
                EXEC('ALTER TABLE orders ADD FOREIGN KEY (customer_id) REFERENCES customers(id)');
            END

            -- 2. Corregir FK de order_details a products (NO DEBE SER CASCADE)
            DECLARE @fk_details_products_name NVARCHAR(128);
            SELECT @fk_details_products_name = fk.name
            FROM sys.foreign_keys fk
            WHERE fk.parent_object_id = OBJECT_ID('order_details') AND fk.referenced_object_id = OBJECT_ID('products');

            IF @fk_details_products_name IS NOT NULL
            BEGIN
                EXEC('ALTER TABLE order_details DROP CONSTRAINT ' + @fk_details_products_name);
                EXEC('ALTER TABLE order_details ADD FOREIGN KEY (product_id) REFERENCES products(id)');
            END

            -- 3. Asegurar que la FK de order_details a orders SÍ SEA CASCADE
            DECLARE @fk_details_orders_name NVARCHAR(128);
            SELECT @fk_details_orders_name = fk.name
            FROM sys.foreign_keys fk
            WHERE fk.parent_object_id = OBJECT_ID('order_details') AND fk.referenced_object_id = OBJECT_ID('orders');

            IF @fk_details_orders_name IS NOT NULL AND (SELECT delete_referential_action FROM sys.foreign_keys WHERE name = @fk_details_orders_name) <> 1 -- 1 = CASCADE
            BEGIN
                EXEC('ALTER TABLE order_details DROP CONSTRAINT ' + @fk_details_orders_name);
                EXEC('ALTER TABLE order_details ADD FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE');
            END
        `;
        await sql.query(fixConstraintsQuery);
        console.log('Constraints de Foreign Key verificados y corregidos.');
        // --- Fin del parche de FKs ---


        // Create order_details table if not exists
        const createOrderDetailsTableQuery = `
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='order_details' and xtype='U')
            CREATE TABLE order_details (
                id INT IDENTITY(1,1) PRIMARY KEY,
                order_id INT NOT NULL,
                product_id INT NOT NULL,
                quantity INT NOT NULL,
                unit_price DECIMAL(10, 2) NOT NULL,
                subtotal AS quantity * unit_price,
                FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
                FOREIGN KEY (product_id) REFERENCES products(id)
            );
        `;
        await sql.query(createOrderDetailsTableQuery);
        console.log('Tabla order_details verificada/creada.');

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

app.get('/api/products/:id', async (req, res) => {
    try {
        const productId = req.params.id;
        const request = new sql.Request();
        request.input('id', sql.Int, productId);
        const result = await request.query`SELECT * FROM products WHERE id = @id`;

        if (result.recordset.length === 0) {
            return res.status(404).json({ error: 'Producto no encontrado.' });
        }
        res.json({ product: result.recordset[0] });
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

app.get('/api/customers/:id', async (req, res) => {
    try {
        const customerId = req.params.id;
        const request = new sql.Request();
        request.input('id', sql.Int, customerId);
        const result = await request.query`SELECT * FROM customers WHERE id = @id`;

        if (result.recordset.length === 0) {
            return res.status(404).json({ error: 'Cliente no encontrado.' });
        }
        res.json({ customer: result.recordset[0] });
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
        const result = await sql.query`
            SELECT o.id, o.numero_pedido, c.name as customer_name, o.order_date, o.total_amount, o.status, o.forma_pago
            FROM orders o
            JOIN customers c ON o.customer_id = c.id
            ORDER BY o.order_date DESC
        `;
        res.json({ orders: result.recordset });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/orders/:id', async (req, res) => {
    try {
        const orderId = req.params.id;

        const orderRequest = new sql.Request();
        orderRequest.input('id', sql.Int, orderId);
        const orderResult = await orderRequest.query`
            SELECT o.id, o.numero_pedido, c.name as customer_name, o.order_date, o.total_amount, o.status, o.forma_pago
            FROM orders o
            JOIN customers c ON o.customer_id = c.id
            WHERE o.id = @id
        `;

        if (orderResult.recordset.length === 0) {
            return res.status(404).json({ error: 'Pedido no encontrado.' });
        }

        const detailsRequest = new sql.Request();
        detailsRequest.input('order_id', sql.Int, orderId);
        const detailsResult = await detailsRequest.query`
            SELECT od.id, od.product_id, p.name as product_name, od.quantity, od.unit_price, od.subtotal
            FROM order_details od
            JOIN products p ON od.product_id = p.id
            WHERE od.order_id = @order_id
        `;

        const order = orderResult.recordset[0];
        order.details = detailsResult.recordset;

        res.json({ order });

    } catch (err) {
        console.error('Error al obtener el pedido:', err.message);
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/orders', async (req, res) => {
    const transaction = new sql.Transaction();
    try {
        const { customer_id, forma_pago, status, items } = req.body;

        if (!customer_id || !forma_pago || !status || !items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ error: 'Faltan datos requeridos para el pedido (cliente, forma de pago, estado o artículos).' });
        }

        await transaction.begin();

        let total_amount = 0;
        const productPrices = {};
        
        try {
            for (const item of items) {
                const productRequest = new sql.Request(transaction);
                productRequest.input('product_id', sql.Int, item.product_id);
                const productResult = await productRequest.query`SELECT price, name FROM products WHERE id = @product_id`;
                if (productResult.recordset.length === 0) {
                    throw new Error(`Producto con ID ${item.product_id} no encontrado en la base de datos.`);
                }
                const price = productResult.recordset[0].price;
                productPrices[item.product_id] = price;
                total_amount += price * item.quantity;
            }
        } catch (err) {
            throw new Error(`Error al verificar los productos: ${err.message}`);
        }

        let newOrderId;
        try {
            const orderRequest = new sql.Request(transaction);
            orderRequest.input('customer_id', sql.Int, customer_id);
            orderRequest.input('total_amount', sql.Decimal(10, 2), total_amount);
            orderRequest.input('status', sql.NVarChar, status);
            orderRequest.input('forma_pago', sql.NVarChar, forma_pago);

            const orderResult = await orderRequest.query`
                INSERT INTO orders (customer_id, total_amount, status, forma_pago)
                VALUES (@customer_id, @total_amount, @status, @forma_pago);
                SELECT SCOPE_IDENTITY() AS id;
            `;
            newOrderId = orderResult.recordset[0].id;
        } catch (err) {
            throw new Error(`Error al insertar en la tabla 'orders': ${err.message}`);
        }

        try {
            for (const item of items) {
                const detailRequest = new sql.Request(transaction);
                detailRequest.input('order_id', sql.Int, newOrderId);
                detailRequest.input('product_id', sql.Int, item.product_id);
                detailRequest.input('quantity', sql.Int, item.quantity);
                detailRequest.input('unit_price', sql.Decimal(10, 2), productPrices[item.product_id]);
                await detailRequest.query`
                    INSERT INTO order_details (order_id, product_id, quantity, unit_price)
                    VALUES (@order_id, @product_id, @quantity, @unit_price);
                `;
            }
        } catch (err) {
            throw new Error(`Error al insertar en la tabla 'order_details': ${err.message}`);
        }

        await transaction.commit();

        res.status(201).json({ message: 'Pedido creado exitosamente', order_id: newOrderId });

    } catch (err) {
        // Si la transacción ha iniciado, se hace rollback
        if (transaction._aborted === false && transaction._rolledBack === false) {
            await transaction.rollback();
        }
        console.error('Error al crear pedido:', err.message);
        // Enviar el mensaje de error específico al cliente
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/orders/:id', async (req, res) => {
    try {
        const orderId = req.params.id;
        const { status, forma_pago } = req.body; // Solo permitir actualizar status y forma_pago

        if (!status && !forma_pago) {
            return res.status(400).json({ error: 'Se requiere al menos un campo para actualizar (status o forma_pago).' });
        }

        let updateQuery = 'UPDATE orders SET ';
        const params = [];
        if (status) {
            updateQuery += 'status = @status';
            params.push({ name: 'status', type: sql.NVarChar, value: status });
        }
        if (forma_pago) {
            if (status) updateQuery += ', ';
            updateQuery += 'forma_pago = @forma_pago';
            params.push({ name: 'forma_pago', type: sql.NVarChar, value: forma_pago });
        }
        updateQuery += ' WHERE id = @id';

        const request = new sql.Request();
        request.input('id', sql.Int, orderId);
        params.forEach(p => request.input(p.name, p.type, p.value));

        const result = await request.query(updateQuery);

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

        // La tabla order_details tiene ON DELETE CASCADE, por lo que no es necesario eliminar los detalles manualmente.
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
