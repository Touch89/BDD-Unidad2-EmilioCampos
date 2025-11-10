const express = require('express');
const app = express();
const port = 3000;

// Middleware para parsear JSON
app.use(express.json());

const mysql = require('mysql2/promise');

// Crea una pool de conexiones con la información de tu base de datos
const pool = mysql.createPool({
    host: 'database-emilio-campos.cx8w0m66yrcx.us-east-2.rds.amazonaws.com',
    user: 'admin',
    password: 'YokedSkate62',
    database: 'tarea_api'
});

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.get("/usuarios", (req, res) => {
    pool.query('SELECT * FROM usuarios')
        .then(([rows, fields]) => {
            res.json(rows);
        })
        .catch(err => {
            console.error('Error executing query', err);
            res.status(500).send('Error retrieving users');
        });
})

app.get("/products", (req, res) => {
    pool.query('SELECT * FROM products')
        .then(([rows, fields]) => {
            res.json(rows);
        })
        .catch(err => {
            console.error('Error executing query', err);
            res.status(500).send('Error retrieving users');
        });
})

app.post("/products", (req, res) => {
    const { name, description, price, stock, image } = req.body;

    // Validación básica
    if (!name || !description || !price || !stock || !image) {
        return res.status(400).json({
            error: 'Todos los campos son obligatorios'
        });
    }

    const query = 'INSERT INTO products (name, description, price, stock, image) VALUES (?, ?, ?, ?, ?)';

    pool.query(query, [name, description, price, stock, image])
        .then(([result]) => {
            res.status(201).json({
                message: 'Producto creado exitosamente',
                id: result.insertId,
                product: {
                    id: result.insertId,
                    name,
                    description,
                    price,
                    stock,
                    image
                }
            });
        })
        .catch(err => {
            console.error('Error creating product', err);

            // Manejar error de producto duplicado (si existe constraint UNIQUE)
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({
                    error: 'El producto ya está registrado'
                });
            }

            res.status(500).json({
                error: 'Error interno del servidor al crear el producto'
            });
        });
});

// Ruta para crear un nuevo usuario
app.post("/users", (req, res) => {
    const { nombre, email, telefono, edad } = req.body;

    // Validación básica
    if (!nombre || !email) {
        return res.status(400).json({
            error: 'Nombre y email son obligatorios'
        });
    }

    // Validar formato de email básico
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({
            error: 'Formato de email inválido'
        });
    }

    const query = 'INSERT INTO usuarios (nombre, email, telefono, edad) VALUES (?, ?, ?, ?)';

    pool.query(query, [nombre, email, telefono || null, edad || null])
        .then(([result]) => {
            res.status(201).json({
                message: 'Usuario creado exitosamente',
                id: result.insertId,
                usuario: {
                    id: result.insertId,
                    nombre,
                    email,
                    telefono,
                    edad
                }
            });
        })
        .catch(err => {
            console.error('Error creating user', err);

            // Manejar error de email duplicado (si existe constraint UNIQUE)
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({
                    error: 'El email ya está registrado'
                });
            }

            res.status(500).json({
                error: 'Error interno del servidor al crear el usuario'
            });
        });
});

// Endpoint POST para crear un usuario
app.post("/usuarios", (req, res) => {
    const { nombre, email, telefono, edad } = req.body;

    // Validación básica
    if (!nombre || !email) {
        return res.status(400).json({
            error: 'Los campos nombre y email son obligatorios'
        });
    }

    // Validar formato de email básico
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({
            error: 'Formato de email inválido'
        });
    }

    const query = 'INSERT INTO usuarios (nombre, email, telefono, edad) VALUES (?, ?, ?, ?)';

    pool.query(query, [nombre, email, telefono || null, edad || null])
        .then(([result]) => {
            res.status(201).json({
                message: 'Usuario creado exitosamente',
                id: result.insertId,
                usuario: {
                    id: result.insertId,
                    nombre,
                    email,
                    telefono,
                    edad
                }
            });
        })
        .catch(err => {
            console.error('Error creating user', err);

            // Manejar error de email duplicado (si existe constraint UNIQUE)
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({
                    error: 'El email ya está registrado'
                });
            }

            res.status(500).json({
                error: 'Error interno del servidor al crear el usuario'
            });
        });
});

// POST api/purchases - Crear una nueva compra
app.post("/api/purchases", async (req, res) => {
    const { user_id, status, details } = req.body;

    // Validaciones
    if (!user_id || !status || !details || !Array.isArray(details)) {
        return res.status(400).json({
            error: 'user_id, status y details son obligatorios'
        });
    }

    if (details.length === 0) {
        return res.status(400).json({
            error: 'Mínimo debe de haber un producto en la compra'
        });
    }

    if (details.length > 5) {
        return res.status(400).json({
            error: 'No se pueden guardar más de 5 productos por compra'
        });
    }

    const connection = await pool.getConnection();
    
    try {
        await connection.beginTransaction();

        // Verificar stock y calcular total
        let total = 0;
        for (const detail of details) {
            const [products] = await connection.query(
                'SELECT stock, price FROM products WHERE id = ?',
                [detail.product_id]
            );

            if (products.length === 0) {
                await connection.rollback();
                return res.status(404).json({
                    error: `Producto con ID ${detail.product_id} no encontrado`
                });
            }

            if (products[0].stock < detail.quantity) {
                await connection.rollback();
                return res.status(400).json({
                    error: `No hay stock disponible para el producto ${detail.product_id}`
                });
            }

            total += detail.price * detail.quantity;
        }

        if (total > 3500) {
            await connection.rollback();
            return res.status(400).json({
                error: 'El total de la compra no puede pasar la cantidad de $3500'
            });
        }

        // Insertar compra
        const [purchaseResult] = await connection.query(
            'INSERT INTO purchases (user_id, total, status, purchase_date) VALUES (?, ?, ?, NOW())',
            [user_id, total, status]
        );

        const purchaseId = purchaseResult.insertId;

        // Insertar detalles y descontar stock
        for (const detail of details) {
            const subtotal = detail.price * detail.quantity;
            
            await connection.query(
                'INSERT INTO purchase_details (purchase_id, product_id, quantity, price, subtotal) VALUES (?, ?, ?, ?, ?)',
                [purchaseId, detail.product_id, detail.quantity, detail.price, subtotal]
            );

            await connection.query(
                'UPDATE products SET stock = stock - ? WHERE id = ?',
                [detail.quantity, detail.product_id]
            );
        }

        await connection.commit();

        res.status(201).json({
            message: 'Compra creada exitosamente',
            purchase_id: purchaseId,
            total: total,
            status: status
        });

    } catch (err) {
        await connection.rollback();
        console.error('Error creating purchase', err);
        res.status(500).json({
            error: 'Error interno del servidor al crear la compra'
        });
    } finally {
        connection.release();
    }
});

// PUT api/purchases/:id - Actualizar una compra existente
app.put("/api/purchases/:id", async (req, res) => {
    const purchaseId = req.params.id;
    const { status, details } = req.body;

    const connection = await pool.getConnection();
    
    try {
        await connection.beginTransaction();

        // Verificar que la compra existe
        const [purchases] = await connection.query(
            'SELECT * FROM purchases WHERE id = ?',
            [purchaseId]
        );

        if (purchases.length === 0) {
            await connection.rollback();
            return res.status(404).json({
                error: 'Compra no encontrada'
            });
        }

        const purchase = purchases[0];

        // No se puede modificar si ya está completada
        if (purchase.status === 'COMPLETED') {
            await connection.rollback();
            return res.status(400).json({
                error: 'Si una compra ya se encuentra en estatus "COMPLETED", no podrá modificarse'
            });
        }

        // Validaciones
        if (details && details.length > 5) {
            await connection.rollback();
            return res.status(400).json({
                error: 'No se pueden guardar más de 5 productos por compra'
            });
        }

        // Obtener detalles actuales para devolver el stock
        const [currentDetails] = await connection.query(
            'SELECT * FROM purchase_details WHERE purchase_id = ?',
            [purchaseId]
        );

        // Devolver stock de los productos actuales
        for (const detail of currentDetails) {
            await connection.query(
                'UPDATE products SET stock = stock + ? WHERE id = ?',
                [detail.quantity, detail.product_id]
            );
        }

        // Eliminar detalles actuales
        await connection.query(
            'DELETE FROM purchase_details WHERE purchase_id = ?',
            [purchaseId]
        );

        let total = 0;

        // Si se proporcionan nuevos detalles
        if (details && details.length > 0) {
            // Verificar stock y calcular nuevo total
            for (const detail of details) {
                const [products] = await connection.query(
                    'SELECT stock, price FROM products WHERE id = ?',
                    [detail.product_id]
                );

                if (products.length === 0) {
                    await connection.rollback();
                    return res.status(404).json({
                        error: `Producto con ID ${detail.product_id} no encontrado`
                    });
                }

                if (products[0].stock < detail.quantity) {
                    await connection.rollback();
                    return res.status(400).json({
                        error: `No hay stock disponible para el producto ${detail.product_id}`
                    });
                }

                total += detail.price * detail.quantity;
            }

            if (total > 3500) {
                await connection.rollback();
                return res.status(400).json({
                    error: 'El total de la compra no puede pasar la cantidad de $3500'
                });
            }

            // Insertar nuevos detalles y descontar stock
            for (const detail of details) {
                const subtotal = detail.price * detail.quantity;
                
                await connection.query(
                    'INSERT INTO purchase_details (purchase_id, product_id, quantity, price, subtotal) VALUES (?, ?, ?, ?, ?)',
                    [purchaseId, detail.product_id, detail.quantity, detail.price, subtotal]
                );

                await connection.query(
                    'UPDATE products SET stock = stock - ? WHERE id = ?',
                    [detail.quantity, detail.product_id]
                );
            }
        }

        // Actualizar compra
        const updateFields = [];
        const updateValues = [];

        if (status !== undefined) {
            updateFields.push('status = ?');
            updateValues.push(status);
        }

        if (details && details.length > 0) {
            updateFields.push('total = ?');
            updateValues.push(total);
        }

        if (updateFields.length > 0) {
            updateValues.push(purchaseId);
            await connection.query(
                `UPDATE purchases SET ${updateFields.join(', ')} WHERE id = ?`,
                updateValues
            );
        }

        await connection.commit();

        res.json({
            message: 'Compra actualizada exitosamente',
            purchase_id: purchaseId
        });

    } catch (err) {
        await connection.rollback();
        console.error('Error updating purchase', err);
        res.status(500).json({
            error: 'Error interno del servidor al actualizar la compra'
        });
    } finally {
        connection.release();
    }
});

// DELETE api/purchases/:id - Eliminar una compra
app.delete("/api/purchases/:id", async (req, res) => {
    const purchaseId = req.params.id;

    const connection = await pool.getConnection();
    
    try {
        await connection.beginTransaction();

        // Verificar que la compra existe
        const [purchases] = await connection.query(
            'SELECT * FROM purchases WHERE id = ?',
            [purchaseId]
        );

        if (purchases.length === 0) {
            await connection.rollback();
            return res.status(404).json({
                error: 'Compra no encontrada'
            });
        }

        const purchase = purchases[0];

        // No se pueden borrar compras completadas
        if (purchase.status === 'COMPLETED') {
            await connection.rollback();
            return res.status(400).json({
                error: 'No se pueden borrar compra que ya se encuentren en estatus "COMPLETED"'
            });
        }

        // Obtener detalles para devolver el stock
        const [details] = await connection.query(
            'SELECT * FROM purchase_details WHERE purchase_id = ?',
            [purchaseId]
        );

        // Devolver stock de los productos
        for (const detail of details) {
            await connection.query(
                'UPDATE products SET stock = stock + ? WHERE id = ?',
                [detail.quantity, detail.product_id]
            );
        }

        // Eliminar detalles
        await connection.query(
            'DELETE FROM purchase_details WHERE purchase_id = ?',
            [purchaseId]
        );

        // Eliminar compra
        await connection.query(
            'DELETE FROM purchases WHERE id = ?',
            [purchaseId]
        );

        await connection.commit();

        res.json({
            message: 'Compra eliminada exitosamente',
            purchase_id: purchaseId
        });

    } catch (err) {
        await connection.rollback();
        console.error('Error deleting purchase', err);
        res.status(500).json({
            error: 'Error interno del servidor al eliminar la compra'
        });
    } finally {
        connection.release();
    }
});

// GET api/purchases - Obtener todas las compras con sus detalles
app.get("/api/purchases", async (req, res) => {
    try {
        // Obtener todas las compras con información del usuario
        const [purchases] = await pool.query(`
            SELECT 
                p.id,
                p.user_id,
                u.name as user,
                p.total,
                p.status,
                DATE_FORMAT(p.purchase_date, '%Y-%m-%dT%H:%i:%s.%fZ') as purchase_date
            FROM purchases p
            LEFT JOIN users u ON p.user_id = u.id
            ORDER BY p.id
        `);

        // Para cada compra, obtener sus detalles
        const purchasesWithDetails = await Promise.all(
            purchases.map(async (purchase) => {
                const [details] = await pool.query(`
                    SELECT 
                        pd.id,
                        pd.product_id,
                        pr.name as product,
                        pd.quantity,
                        pd.price,
                        pd.subtotal
                    FROM purchase_details pd
                    LEFT JOIN products pr ON pd.product_id = pr.id
                    WHERE pd.purchase_id = ?
                    ORDER BY pd.id
                `, [purchase.id]);

                return {
                    id: purchase.id,
                    user: purchase.user,
                    total: purchase.total,
                    status: purchase.status,
                    purchase_date: purchase.purchase_date,
                    details: details
                };
            })
        );

        res.json(purchasesWithDetails);

    } catch (err) {
        console.error('Error retrieving purchases', err);
        res.status(500).json({
            error: 'Error interno del servidor al obtener las compras'
        });
    }
});

// GET api/purchases/:id - Obtener una compra específica por su ID
app.get("/api/purchases/:id", async (req, res) => {
    const purchaseId = req.params.id;

    try {
        // Obtener la compra con información del usuario
        const [purchases] = await pool.query(`
            SELECT 
                p.id,
                p.user_id,
                u.name as user,
                p.total,
                p.status,
                DATE_FORMAT(p.purchase_date, '%Y-%m-%dT%H:%i:%s.%fZ') as purchase_date
            FROM purchases p
            LEFT JOIN users u ON p.user_id = u.id
            WHERE p.id = ?
        `, [purchaseId]);

        if (purchases.length === 0) {
            return res.status(404).json({
                error: 'Compra no encontrada'
            });
        }

        const purchase = purchases[0];

        // Obtener los detalles de la compra
        const [details] = await pool.query(`
            SELECT 
                pd.id,
                pd.product_id,
                pr.name as product,
                pd.quantity,
                pd.price,
                pd.subtotal
            FROM purchase_details pd
            LEFT JOIN products pr ON pd.product_id = pr.id
            WHERE pd.purchase_id = ?
            ORDER BY pd.id
        `, [purchaseId]);

        const purchaseWithDetails = {
            id: purchase.id,
            user: purchase.user,
            total: purchase.total,
            status: purchase.status,
            purchase_date: purchase.purchase_date,
            details: details
        };

        res.json(purchaseWithDetails);

    } catch (err) {
        console.error('Error retrieving purchase', err);
        res.status(500).json({
            error: 'Error interno del servidor al obtener la compra'
        });
    }
});

app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
});