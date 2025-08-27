//creo una lista selecionando todos los elementos li del div navegacion
let lista = document.querySelectorAll('.navegacion li'); 
// creo una función para establecer cual de todos los items es el link activo
function LinkActivo(){ 
    //a cada item de la lista le quito la clase hovered, si la tuviera
    lista.forEach((item) =>
    item.classList.remove('hovered'));
 // al elemento activo le asigno la clase hovered
    this.classList.add('hovered');
}
// a cada elemento de la lista de navegación que pase por encima con el mouse le asigno la condición de link activo
lista.forEach((item) =>
item.addEventListener('mouseover', LinkActivo));



// Toggle

let onOff = document.querySelector('.toggle');
let navegacion = document.querySelector('.navegacion');
let principal = document.querySelector('.principal');

onOff.onclick =function(){
    navegacion.classList.toggle('active')
    principal.classList.toggle('active')
}

// --- Funciones para cargar contenido dinámico ---

// Función para cargar métricas del dashboard
async function loadDashboardMetrics() {
    try {
        const response = await fetch('http://localhost:3000/api/metrics');
        const data = await response.json();

        if (data.metrics) {
            data.metrics.forEach(metric => {
                let elementId;
                let valueToDisplay = metric.value; // Default value

                switch (metric.name) {
                    case 'Visitas Página':
                        elementId = 'dailyVisits';
                        break;
                    case 'Ventas Hoy':
                        elementId = 'sales';
                        break;
                    case 'Usuarios Activos': // Mapping to comments for now
                        elementId = 'comments';
                        break;
                    case 'Facturación Total': // New case for Facturación Total
                        elementId = 'billing';
                        valueToDisplay = `$ ${metric.value}`; // Prepend $ sign
                        break;
                    default:
                        console.warn(`No se encontró un ID para la métrica: ${metric.name}`);
                        return;
                }
                const element = document.getElementById(elementId);
                if (element) {
                    element.innerText = valueToDisplay;
                }
            });
        }
    } catch (error) {
        console.error('Error al cargar las métricas:', error);
    }
}

// Función para cargar el contenido del Dashboard
function loadDashboard() {
    principal.innerHTML = `
        <div class="barrasuperior">
            <div class="toggle">
                <i class="fa-solid fa-bars"></i>
            </div>
            <!-- búsquedas-->
            <div class="buscar">
                <label>
                    <input type="text" placeholder="Buscar ..." name="buscar" id="textoBusqueda">
                    <i class="fa-solid fa-magnifying-glass"></i>
                </label>
            </div>
            <!-- imagen de usuario-->
            <div class="usuario">
                <img src="./imgs/perfil1.jpg" alt="imagen de perfil">
            </div>
        </div>
        <!-- tarjetas-->
        <div class="cards">
            <div class="card">
                <div>
                    <div class="numeros" id="dailyVisits">0</div>
                    <div class="cardName">Visitas Diarias</div>
                </div>
                    <div class="iconBox">
                    <i class="fa-regular fa-eye"></i>
                </div>
            </div>
            <div class="card">
                <div>
                    <div class="numeros" id="sales">0</div>
                    <div class="cardName">Ventas</div>
                </div>
                <div class="iconBox">
                    <i class="fa-solid fa-cart-shopping"></i>
                </div>
            </div>
            <div class="card">
                <div>
                    <div class="numeros" id="comments">0</div>
                    <div class="cardName">Comentarios</div>
                </div>
                <div class="iconBox">
                    <i class="fa-regular fa-comments"></i>
                </div>
            </div>
            <div class="card">
                <div>
                    <div class="numeros" id="billing">$ 0</div>
                    <div class="cardName">Facturación</div>
                </div>
                <div class="iconBox">
                    <i class="fa-solid fa-sack-dollar"></i>
                </div>
            </div>
        </div>
        <!-- Detalle de pedidos-->
        <div class="detalles">
            <div class="ordenesRecientes">
                <div class="encabezado">
                    <h2>Pedidos Recientes</h2>
                    <a href="#" class="boton">Ver Todo</a>
                </div>
                <table>
                    <thead>
                        <tr>
                            <td>Nombre</td>
                            <td>Precio</td>
                            <td>Forma de Pago</td>
                            <td>Estado</td>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Heladera c/ freezer Aurora</td>
                            <td>$ 145000</td>
                            <td>Contado</td>
                            <td><span class="estado Entregado">Entregado</span></td>
                        </tr>
                        <tr>
                            <td>Parlantes Bluetooh</td>
                            <td>$ 45000</td>
                            <td>Tarjeta</td>
                            <td><span class="estado Devuelto">Devuelto</span></td>
                        </tr>
                        <tr>
                            <td>Auriculares Sony</td>
                            <td>$ 15000</td>
                            <td>Contado</td>
                            <td><span class="estado EnProgreso">En Progreso</span></td>
                        </tr>
                        <tr>
                            <td>Notebook DELL Latitude E5000</td>
                            <td>$ 545000</td>
                            <td>Cheques 0-30-60</td>
                            <td><span class="estado EnStock">En Stock</span></td>
                        </tr>
                        <tr>
                            <td>Bicicleta Venzo Mod. "Viento"</td>
                            <td>$ 158000</td>
                            <td>Contado</td>
                            <td><span class="estado Devuelto">Devuelto</span></td>
                        </tr>
                        <tr>
                            <td>Combo Actualización PC i7-12va Gen.</td>
                            <td>$ 450000</td>
                            <td>Cuenta Corriente</td>
                            <td><span class="estado EnProgreso">En Progreso</span></td>
                        </tr>
                        <tr>
                            <td>Cocina Orbis Convecta</td>
                            <td>$ 470000</td>
                            <td>Tarjeta</td>
                            <td><span class="estado EnStock">En Stock</span></td>
                        </tr>
                        <tr>
                            <td>Hidrolavadora De-Walt</td>
                            <td>$ 95000</td>
                            <td>Cheques 0-30-60</td>
                            <td><span class="estado Entregado">Entregado</span></td>
                        </tr>
                        <tr>
                            <td>Impresora Epson L-780</td>
                            <td>$ 35000</td>
                            <td>Contado</td>
                            <td><span class="estado EnProgreso">En Progreso</span></td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <!-- Nuevos Clientes-->
            <div class="clientesNuevos">
                <div class="cards">
                    <h2>Clientes Nuevos</h2>
                </div>
                <table>
                    <tr>
                        <td width="60px"><div class="imgBx"><img src="./imgs/perfil2.jpg"></div></td>
                        <td><h4>Damiana<br><span>Italia</span></h4></td>
                    </tr>
                    <tr>
                        <td width="60px"><div class="imgBx"><img src="./imgs/perfil3.jpg"></div></td>
                        <td><h4>Alexa<br><span>Estados Unidos</span></h4></td>
                    </tr>
                    <tr>
                        <td width="60px"><div class="imgBx"><img src="./imgs/perfil4.jpg"></div></td>
                        <td><h4>Javier<br><span>Argentina</span></h4></td>
                    </tr>
                    <tr>
                        <td width="60px"><div class="imgBx"><img src="./imgs/perfil5.jpg"></div></td>
                        <td><h4>Alejandra<br><span>España</span></h4></td>
                    </tr>
                    <tr>
                        <td width="60px"><div class="imgBx"><img src="./imgs/perfil6.jpg"></div></td>
                        <td><h4>Victor<br><span>Colombia</span></h4></td>
                    </tr>
                    <tr>
                        <td width="60px"><div class="imgBx"><img src="./imgs/perfil5.jpg"></div></td>
                        <td><h4>Alejandra<br><span>España</span></h4></td>
                    </tr>
                    <tr>
                        <td width="60px"><div class="imgBx"><img src="./imgs/perfil6.jpg"></div></td>
                        <td><h4>Victor<br><span>Colombia</span></h4></td>
                    </tr>
                    <tr>
                        <td width="60px"><div class="imgBx"><img src="./imgs/perfil6.jpg"></div></td>
                        <td><h4>Victor<br><span>Colombia</span></h4></td>
                    </tr>
                    <tr>
                        <td width="60px"><div class="imgBx"><img src="./imgs/perfil6.jpg"></div></td>
                        <td><h4>Victor<br><span>Colombia</span></h4></td>
                    </tr>
                </table>
            </div>
        </div>
    `;
    loadDashboardMetrics(); // Load metrics after dashboard HTML is rendered
}

// Función para cargar el contenido de Productos
async function loadProducts() {
    principal.innerHTML = `
        <div class="barrasuperior">
            <div class="toggle">
                <i class="fa-solid fa-bars"></i>
            </div>
            <div class="buscar">
                <label>
                    <input type="text" placeholder="Buscar ..." name="buscar" id="textoBusqueda">
                    <i class="fa-solid fa-magnifying-glass"></i>
                </label>
            </div>
            <div class="usuario">
                <img src="./imgs/perfil1.jpg" alt="imagen de perfil">
            </div>
        </div>
        <div class="detalles">
            <div class="ordenesRecientes">
                <div class="encabezado">
                    <h2>Lista de Productos</h2>
                    <a href="#" class="boton" id="addProductBtn">Añadir Producto</a>
                </div>
                <table id="productsTable">
                    <thead>
                        <tr>
                            <td>ID</td>
                            <td>Nombre</td>
                            <td>Descripción</td>
                            <td>Precio</td>
                            <td>Stock</td>
                            <td>Acciones</td>
                        </tr>
                    </thead>
                    <tbody>
                        <!-- Products will be loaded here -->
                    </tbody>
                </table>
            </div>
            <div id="addProductFormContainer" class="form-container" style="display:none;">
                <h2>Añadir Nuevo Producto</h2>
                <form id="addProductForm">
                    <div style="margin-bottom: 10px;">
                        <label for="productName" style="display: block; margin-bottom: 5px;">Nombre:</label>
                        <input type="text" id="productName" name="name" required style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 44px;">
                    </div>
                    <div style="margin-bottom: 10px;">
                        <label for="productDescription" style="display: block; margin-bottom: 5px;">Descripción:</label>
                        <textarea id="productDescription" name="description" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;"></textarea>
                    </div>
                    <div style="margin-bottom: 10px;">
                        <label for="productPrice" style="display: block; margin-bottom: 5px;">Precio:</label>
                        <input type="number" id="productPrice" name="price" step="0.01" required style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                    </div>
                    <div style="margin-bottom: 10px;">
                        <label for="productStock" style="display: block; margin-bottom: 5px;">Stock:</label>
                        <input type="number" id="productStock" name="stock" required style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                    </div>
                    <button type="submit" style="background-color: #4CAF50; color: white; padding: 10px 15px; border: none; border-radius: 4px; cursor: pointer;min-width: 150px;">Guardar Producto</button>
                    <button type="button" id="cancelAddProduct" style="background-color: #f44336; color: white; padding: 10px 15px; border: none; border-radius: 4px; cursor: pointer; margin-left: 10px;min-width: 150px;">Cancelar</button>
                </form>
            </div>
            <div id="editProductFormContainer" class="form-container" style="display:none;">
                <h2>Editar Producto</h2>
                <form id="editProductForm">
                    <input type="hidden" id="editProductId" name="id">
                    <div style="margin-bottom: 10px;">
                        <label for="editProductName" style="display: block; margin-bottom: 5px;">Nombre:</label>
                        <input type="text" id="editProductName" name="name" required style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 44px;">
                    </div>
                    <div style="margin-bottom: 10px;">
                        <label for="editProductDescription" style="display: block; margin-bottom: 5px;">Descripción:</label>
                        <textarea id="editProductDescription" name="description" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;"></textarea>
                    </div>
                    <div style="margin-bottom: 10px;">
                        <label for="editProductPrice" style="display: block; margin-bottom: 5px;">Precio:</label>
                        <input type="number" id="editProductPrice" name="price" step="0.01" required style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                    </div>
                    <div style="margin-bottom: 10px;">
                        <label for="editProductStock" style="display: block; margin-bottom: 5px;">Stock:</label>
                        <input type="number" id="editProductStock" name="stock" required style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                    </div>
                    <button type="submit" style="background-color: #008CBA; color: white; padding: 10px 15px; border: none; border-radius: 4px; cursor: pointer;min-width: 150px;">Actualizar Producto</button>
                    <button type="button" id="cancelEditProduct" style="background-color: #f44336; color: white; padding: 10px 15px; border: none; border-radius: 4px; cursor: pointer; margin-left: 10px;min-width: 150px;">Cancelar</button>
                </form>
            </div>
        </div>
    `;

    // --- Event Listeners for Product Forms ---

    // Show "Add Product" form
    document.getElementById('addProductBtn').addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('addProductFormContainer').style.display = 'block';
        document.getElementById('editProductFormContainer').style.display = 'none';
    });

    // Cancel "Add Product"
    document.getElementById('cancelAddProduct').addEventListener('click', () => {
        document.getElementById('addProductFormContainer').style.display = 'none';
        document.getElementById('addProductForm').reset();
    });

    // Cancel "Edit Product"
    document.getElementById('cancelEditProduct').addEventListener('click', () => {
        document.getElementById('editProductFormContainer').style.display = 'none';
        document.getElementById('editProductForm').reset();
    });

    // Submit "Add Product" form
    document.getElementById('addProductForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const form = e.target;
        const formData = new FormData(form);
        const productData = Object.fromEntries(formData.entries());
        productData.price = parseFloat(productData.price);
        productData.stock = parseInt(productData.stock, 10);

        try {
            const response = await fetch('http://localhost:3000/api/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(productData)
            });
            if (response.ok) {
                alert('Producto añadido exitosamente!');
                form.reset();
                document.getElementById('addProductFormContainer').style.display = 'none';
                loadProducts();
            } else {
                const errorData = await response.json();
                alert(`Error al añadir producto: ${errorData.error || response.statusText}`);
            }
        } catch (error) {
            console.error('Error al enviar el formulario:', error);
            alert('Error de conexión al añadir producto.');
        }
    });

    // Submit "Edit Product" form
    document.getElementById('editProductForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const form = e.target;
        const formData = new FormData(form);
        const productData = Object.fromEntries(formData.entries());
        const productId = productData.id;
        productData.price = parseFloat(productData.price);
        productData.stock = parseInt(productData.stock, 10);

        try {
            const response = await fetch(`http://localhost:3000/api/products/${productId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(productData)
            });
            if (response.ok) {
                alert('Producto actualizado exitosamente!');
                form.reset();
                document.getElementById('editProductFormContainer').style.display = 'none';
                loadProducts();
            } else {
                const errorData = await response.json();
                alert(`Error al actualizar producto: ${errorData.error || response.statusText}`);
            }
        } catch (error) {
            console.error('Error al enviar el formulario de edición:', error);
            alert('Error de conexión al actualizar producto.');
        }
    });

    // --- Load Product Data and Set Up Table Actions ---
    try {
        const response = await fetch('http://localhost:3000/api/products');
        const data = await response.json();
        const productsTableBody = document.querySelector('#productsTable tbody');
        productsTableBody.innerHTML = ''; // Clear existing content

        if (data.products && data.products.length > 0) {
            data.products.forEach(product => {
                const row = productsTableBody.insertRow();
                row.innerHTML = `
                    <td>${product.id}</td>
                    <td>${product.name}</td>
                    <td>${product.description || ''}</td>
                    <td>$ ${product.price.toFixed(2)}</td>
                    <td>${product.stock}</td>
                    <td>
                        <button class="btn-edit" data-id="${product.id}">Editar</button>
                        <button class="btn-delete" data-id="${product.id}">Eliminar</button>
                    </td>
                `;
            });
        } else {
            productsTableBody.innerHTML = '<tr><td colspan="6">No hay productos disponibles.</td></tr>';
        }

        // Event Delegation for Edit and Delete buttons
        document.getElementById('productsTable').addEventListener('click', async (e) => {
            const target = e.target;
            const id = target.dataset.id;

            if (target.classList.contains('btn-delete')) {
                if (confirm(`¿Estás seguro de que quieres eliminar el producto con ID ${id}?`)) {
                    try {
                        const response = await fetch(`http://localhost:3000/api/products/${id}`, { method: 'DELETE' });
                        if (response.ok) {
                            alert('Producto eliminado exitosamente.');
                            loadProducts();
                        } else {
                            const errorData = await response.json();
                            alert(`Error al eliminar producto: ${errorData.error || response.statusText}`);
                        }
                    } catch (error) {
                        console.error('Error al eliminar producto:', error);
                        alert('Error de conexión al eliminar producto.');
                    }
                }
            }

            if (target.classList.contains('btn-edit')) {
                // Find the product data from the already fetched list
                const productToEdit = data.products.find(p => p.id == id);
                if (productToEdit) {
                    // Populate and show the edit form
                    document.getElementById('editProductId').value = productToEdit.id;
                    document.getElementById('editProductName').value = productToEdit.name;
                    document.getElementById('editProductDescription').value = productToEdit.description || '';
                    document.getElementById('editProductPrice').value = productToEdit.price;
                    document.getElementById('editProductStock').value = productToEdit.stock;
                    
                    document.getElementById('editProductFormContainer').style.display = 'block';
                    document.getElementById('addProductFormContainer').style.display = 'none';
                }
            }
        });

    } catch (error) {
        console.error('Error al cargar productos:', error);
        principal.innerHTML = '<p>Error al cargar productos. Por favor, verifica el servidor.</p>';
    }
}

// Función para cargar el contenido de Clientes
async function loadCustomers() {
    principal.innerHTML = `
        <div class="barrasuperior">
            <div class="toggle">
                <i class="fa-solid fa-bars"></i>
            </div>
            <div class="buscar">
                <label>
                    <input type="text" placeholder="Buscar ..." name="buscar" id="textoBusqueda">
                    <i class="fa-solid fa-magnifying-glass"></i>
                </label>
            </div>
            <div class="usuario">
                <img src="./imgs/perfil1.jpg" alt="imagen de perfil">
            </div>
        </div>
        <div class="detalles">
            <div class="ordenesRecientes">
                <div class="encabezado">
                    <h2>Lista de Clientes</h2>
                    <a href="#" class="boton" id="addCustomerBtn">Añadir Cliente</a>
                </div>
                <table id="customersTable">
                    <thead>
                        <tr>
                            <td>ID</td>
                            <td>Nombre</td>
                            <td>Email</td>
                            <td>Teléfono</td>
                            <td>Dirección</td>
                            <td>Acciones</td>
                        </tr>
                    </thead>
                    <tbody>
                        <!-- Customers will be loaded here -->
                    </tbody>
                </table>
            </div>
            <div id="addCustomerFormContainer" class="form-container" style="display:none;">
                <h2>Añadir Nuevo Cliente</h2>
                <form id="addCustomerForm">
                    <div style="margin-bottom: 10px;">
                        <label for="customerName" style="display: block; margin-bottom: 5px;">Nombre:</label>
                        <input type="text" id="customerName" name="name" required style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                    </div>
                    <div style="margin-bottom: 10px;">
                        <label for="customerEmail" style="display: block; margin-bottom: 5px;">Email:</label>
                        <input type="email" id="customerEmail" name="email" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                    </div>
                    <div style="margin-bottom: 10px;">
                        <label for="customerPhone" style="display: block; margin-bottom: 5px;">Teléfono:</label>
                        <input type="text" id="customerPhone" name="phone" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                    </div>
                    <div style="margin-bottom: 10px;">
                        <label for="customerAddress" style="display: block; margin-bottom: 5px;">Dirección:</label>
                        <textarea id="customerAddress" name="address" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;"></textarea>
                    </div>
                    <button type="submit" class="btn-edit">Guardar Cliente</button>
                    <button type="button" id="cancelAddCustomer" class="btn-delete">Cancelar</button>
                </form>
            </div>
            <div id="editCustomerFormContainer" class="form-container" style="display:none;">
                <h2>Editar Cliente</h2>
                <form id="editCustomerForm">
                    <input type="hidden" id="editCustomerId" name="id">
                    <div style="margin-bottom: 10px;">
                        <label for="editCustomerName" style="display: block; margin-bottom: 5px;">Nombre:</label>
                        <input type="text" id="editCustomerName" name="name" required style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                    </div>
                    <div style="margin-bottom: 10px;">
                        <label for="editCustomerEmail" style="display: block; margin-bottom: 5px;">Email:</label>
                        <input type="email" id="editCustomerEmail" name="email" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                    </div>
                    <div style="margin-bottom: 10px;">
                        <label for="editCustomerPhone" style="display: block; margin-bottom: 5px;">Teléfono:</label>
                        <input type="text" id="editCustomerPhone" name="phone" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                    </div>
                    <div style="margin-bottom: 10px;">
                        <label for="editCustomerAddress" style="display: block; margin-bottom: 5px;">Dirección:</label>
                        <textarea id="editCustomerAddress" name="address" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;"></textarea>
                    </div>
                    <button type="submit" class="btn-edit">Actualizar Cliente</button>
                    <button type="button" id="cancelEditCustomer" class="btn-delete">Cancelar</button>
                </form>
            </div>
        </div>
    `;

    // --- Event Listeners for Customer Forms ---
    document.getElementById('addCustomerBtn').addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('addCustomerFormContainer').style.display = 'block';
        document.getElementById('editCustomerFormContainer').style.display = 'none';
    });

    document.getElementById('cancelAddCustomer').addEventListener('click', () => {
        document.getElementById('addCustomerFormContainer').style.display = 'none';
        document.getElementById('addCustomerForm').reset();
    });

    document.getElementById('cancelEditCustomer').addEventListener('click', () => {
        document.getElementById('editCustomerFormContainer').style.display = 'none';
        document.getElementById('editCustomerForm').reset();
    });

    document.getElementById('addCustomerForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const form = e.target;
        const formData = new FormData(form);
        const customerData = Object.fromEntries(formData.entries());

        try {
            const response = await fetch('http://localhost:3000/api/customers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(customerData)
            });
            if (response.ok) {
                alert('Cliente añadido exitosamente!');
                form.reset();
                document.getElementById('addCustomerFormContainer').style.display = 'none';
                loadCustomers();
            } else {
                const errorData = await response.json();
                alert(`Error al añadir cliente: ${errorData.error || response.statusText}`);
            }
        } catch (error) {
            console.error('Error al enviar formulario de cliente:', error);
            alert('Error de conexión al añadir cliente.');
        }
    });

    document.getElementById('editCustomerForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const form = e.target;
        const formData = new FormData(form);
        const customerData = Object.fromEntries(formData.entries());
        const customerId = customerData.id;

        try {
            const response = await fetch(`http://localhost:3000/api/customers/${customerId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(customerData)
            });
            if (response.ok) {
                alert('Cliente actualizado exitosamente!');
                form.reset();
                document.getElementById('editCustomerFormContainer').style.display = 'none';
                loadCustomers();
            } else {
                const errorData = await response.json();
                alert(`Error al actualizar cliente: ${errorData.error || response.statusText}`);
            }
        } catch (error) {
            console.error('Error al enviar formulario de edición de cliente:', error);
            alert('Error de conexión al actualizar cliente.');
        }
    });

    // --- Load Customer Data and Set Up Table Actions ---
    try {
        const response = await fetch('http://localhost:3000/api/customers');
        const data = await response.json();
        const customersTableBody = document.querySelector('#customersTable tbody');
        customersTableBody.innerHTML = ''; // Clear existing content

        if (data.customers && data.customers.length > 0) {
            data.customers.forEach(customer => {
                const row = customersTableBody.insertRow();
                row.innerHTML = `
                    <td>${customer.id}</td>
                    <td>${customer.name}</td>
                    <td>${customer.email || ''}</td>
                    <td>${customer.phone || ''}</td>
                    <td>${customer.address || ''}</td>
                    <td>
                        <button class="btn-edit" data-id="${customer.id}">Editar</button>
                        <button class="btn-delete" data-id="${customer.id}">Eliminar</button>
                    </td>
                `;
            });
        } else {
            customersTableBody.innerHTML = '<tr><td colspan="6">No hay clientes disponibles.</td></tr>';
        }

        document.getElementById('customersTable').addEventListener('click', async (e) => {
            const target = e.target;
            const id = target.dataset.id;

            if (target.classList.contains('btn-delete')) {
                if (confirm(`¿Estás seguro de que quieres eliminar el cliente con ID ${id}?`)) {
                    try {
                        const response = await fetch(`http://localhost:3000/api/customers/${id}`, { method: 'DELETE' });
                        if (response.ok) {
                            alert('Cliente eliminado exitosamente.');
                            loadCustomers();
                        } else {
                            const errorData = await response.json();
                            alert(`Error al eliminar cliente: ${errorData.error || response.statusText}`);
                        }
                    } catch (error) {
                        console.error('Error al eliminar cliente:', error);
                        alert('Error de conexión al eliminar cliente.');
                    }
                }
            }

            if (target.classList.contains('btn-edit')) {
                const customerToEdit = data.customers.find(c => c.id == id);
                if (customerToEdit) {
                    document.getElementById('editCustomerId').value = customerToEdit.id;
                    document.getElementById('editCustomerName').value = customerToEdit.name;
                    document.getElementById('editCustomerEmail').value = customerToEdit.email || '';
                    document.getElementById('editCustomerPhone').value = customerToEdit.phone || '';
                    document.getElementById('editCustomerAddress').value = customerToEdit.address || '';
                    
                    document.getElementById('editCustomerFormContainer').style.display = 'block';
                    document.getElementById('addCustomerFormContainer').style.display = 'none';
                }
            }
        });

    } catch (error) {
        console.error('Error al cargar clientes:', error);
        principal.innerHTML = '<p>Error al cargar clientes. Por favor, verifica el servidor.</p>';
    }
}


// Función para cargar el contenido de Pedidos
async function loadOrders() {
    principal.innerHTML = `
        <div class="barrasuperior">
            <div class="toggle">
                <i class="fa-solid fa-bars"></i>
            </div>
            <div class="buscar">
                <label>
                    <input type="text" placeholder="Buscar ..." name="buscar" id="textoBusqueda">
                    <i class="fa-solid fa-magnifying-glass"></i>
                </label>
            </div>
            <div class="usuario">
                <img src="./imgs/perfil1.jpg" alt="imagen de perfil">
            </div>
        </div>
        <div class="detalles">
            <div class="ordenesRecientes">
                <div class="encabezado">
                    <h2>Lista de Pedidos</h2>
                    <a href="#" class="boton" id="addOrderBtn">Añadir Pedido</a>
                </div>
                <table id="ordersTable">
                    <thead>
                        <tr>
                            <td>ID</td>
                            <td>Cliente</td>
                            <td>Fecha</td>
                            <td>Total</td>
                            <td>Estado</td>
                            <td>Acciones</td>
                        </tr>
                    </thead>
                    <tbody>
                        <!-- Orders will be loaded here -->
                    </tbody>
                </table>
            </div>
            <div id="addOrderFormContainer" class="form-container" style="display:none;">
                <h2>Añadir Nuevo Pedido</h2>
                <form id="addOrderForm">
                    <div style="margin-bottom: 10px;">
                        <label for="orderCustomer" style="display: block; margin-bottom: 5px;">Cliente:</label>
                        <select id="orderCustomer" name="customer_id" required style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;"></select>
                    </div>
                    <div style="margin-bottom: 10px;">
                        <label for="orderTotal" style="display: block; margin-bottom: 5px;">Total:</label>
                        <input type="number" id="orderTotal" name="total_amount" step="0.01" required style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                    </div>
                    <div style="margin-bottom: 10px;">
                        <label for="orderStatus" style="display: block; margin-bottom: 5px;">Estado:</label>
                        <input type="text" id="orderStatus" name="status" required style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                    </div>
                    <button type="submit" class="btn-edit">Guardar Pedido</button>
                    <button type="button" id="cancelAddOrder" class="btn-delete">Cancelar</button>
                </form>
            </div>
            <div id="editOrderFormContainer" class="form-container" style="display:none;">
                <h2>Editar Pedido</h2>
                <form id="editOrderForm">
                    <input type="hidden" id="editOrderId" name="id">
                    <div style="margin-bottom: 10px;">
                        <label for="editOrderCustomer" style="display: block; margin-bottom: 5px;">Cliente:</label>
                        <select id="editOrderCustomer" name="customer_id" required style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;"></select>
                    </div>
                    <div style="margin-bottom: 10px;">
                        <label for="editOrderTotal" style="display: block; margin-bottom: 5px;">Total:</label>
                        <input type="number" id="editOrderTotal" name="total_amount" step="0.01" required style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                    </div>
                    <div style="margin-bottom: 10px;">
                        <label for="editOrderStatus" style="display: block; margin-bottom: 5px;">Estado:</label>
                        <input type="text" id="editOrderStatus" name="status" required style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                    </div>
                    <button type="submit" class="btn-edit">Actualizar Pedido</button>
                    <button type="button" id="cancelEditOrder" class="btn-delete">Cancelar</button>
                </form>
            </div>
        </div>
    `;

    // --- Load Data and Set Up Actions ---
    try {
        // Fetch orders and customers in parallel
        const [ordersResponse, customersResponse] = await Promise.all([
            fetch('http://localhost:3000/api/orders'),
            fetch('http://localhost:3000/api/customers')
        ]);

        const ordersData = await ordersResponse.json();
        const customersData = await customersResponse.json();
        const customers = customersData.customers || [];
        const orders = ordersData.orders || [];

        // Create a map of customer IDs to names for easy lookup
        const customerMap = customers.reduce((map, customer) => {
            map[customer.id] = customer.name;
            return map;
        }, {});

        // Populate customer dropdowns
        const customerOptions = customers.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
        document.getElementById('orderCustomer').innerHTML = customerOptions;
        document.getElementById('editOrderCustomer').innerHTML = customerOptions;

        // Populate orders table
        const ordersTableBody = document.querySelector('#ordersTable tbody');
        ordersTableBody.innerHTML = '';
        if (orders.length > 0) {
            orders.forEach(order => {
                const row = ordersTableBody.insertRow();
                row.innerHTML = `
                    <td>${order.id}</td>
                    <td>${customerMap[order.customer_id] || 'Cliente no encontrado'}</td>
                    <td>${new Date(order.order_date).toLocaleDateString()}</td>
                    <td>$ ${order.total_amount.toFixed(2)}</td>
                    <td>${order.status}</td>
                    <td>
                        <button class="btn-edit" data-id="${order.id}">Editar</button>
                        <button class="btn-delete" data-id="${order.id}">Eliminar</button>
                    </td>
                `;
            });
        } else {
            ordersTableBody.innerHTML = '<tr><td colspan="6">No hay pedidos disponibles.</td></tr>';
        }

        // --- Event Listeners for Order Forms ---
        document.getElementById('addOrderBtn').addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('addOrderFormContainer').style.display = 'block';
            document.getElementById('editOrderFormContainer').style.display = 'none';
        });

        document.getElementById('cancelAddOrder').addEventListener('click', () => {
            document.getElementById('addOrderFormContainer').style.display = 'none';
            document.getElementById('addOrderForm').reset();
        });

        document.getElementById('cancelEditOrder').addEventListener('click', () => {
            document.getElementById('editOrderFormContainer').style.display = 'none';
            document.getElementById('editOrderForm').reset();
        });

        document.getElementById('addOrderForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const form = e.target;
            const formData = new FormData(form);
            const orderData = Object.fromEntries(formData.entries());
            orderData.total_amount = parseFloat(orderData.total_amount);

            try {
                const response = await fetch('http://localhost:3000/api/orders', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(orderData)
                });
                if (response.ok) {
                    alert('Pedido añadido exitosamente!');
                    loadOrders();
                } else {
                    const errorData = await response.json();
                    alert(`Error al añadir pedido: ${errorData.error || response.statusText}`);
                }
            } catch (error) {
                console.error('Error al enviar formulario de pedido:', error);
                alert('Error de conexión al añadir pedido.');
            }
        });

        document.getElementById('editOrderForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const form = e.target;
            const formData = new FormData(form);
            const orderData = Object.fromEntries(formData.entries());
            const orderId = orderData.id;
            orderData.total_amount = parseFloat(orderData.total_amount);

            try {
                const response = await fetch(`http://localhost:3000/api/orders/${orderId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(orderData)
                });
                if (response.ok) {
                    alert('Pedido actualizado exitosamente!');
                    loadOrders();
                } else {
                    const errorData = await response.json();
                    alert(`Error al actualizar pedido: ${errorData.error || response.statusText}`);
                }
            } catch (error) {
                console.error('Error al enviar formulario de edición de pedido:', error);
                alert('Error de conexión al actualizar pedido.');
            }
        });

        // Event Delegation for Table Actions
        document.getElementById('ordersTable').addEventListener('click', async (e) => {
            const target = e.target;
            const id = target.dataset.id;

            if (target.classList.contains('btn-delete')) {
                if (confirm(`¿Estás seguro de que quieres eliminar el pedido con ID ${id}?`)) {
                    try {
                        const response = await fetch(`http://localhost:3000/api/orders/${id}`, { method: 'DELETE' });
                        if (response.ok) {
                            alert('Pedido eliminado exitosamente.');
                            loadOrders();
                        } else {
                            const errorData = await response.json();
                            alert(`Error al eliminar pedido: ${errorData.error || response.statusText}`);
                        }
                    } catch (error) {
                        console.error('Error al eliminar pedido:', error);
                        alert('Error de conexión al eliminar pedido.');
                    }
                }
            }

            if (target.classList.contains('btn-edit')) {
                const orderToEdit = orders.find(o => o.id == id);
                if (orderToEdit) {
                    document.getElementById('editOrderId').value = orderToEdit.id;
                    document.getElementById('editOrderCustomer').value = orderToEdit.customer_id;
                    document.getElementById('editOrderTotal').value = orderToEdit.total_amount;
                    document.getElementById('editOrderStatus').value = orderToEdit.status;
                    
                    document.getElementById('editOrderFormContainer').style.display = 'block';
                    document.getElementById('addOrderFormContainer').style.display = 'none';
                }
            }
        });

    } catch (error) {
        console.error('Error al cargar pedidos:', error);
        principal.innerHTML = '<p>Error al cargar pedidos. Por favor, verifica el servidor.</p>';
    }
}


// Event Listeners para la navegación
document.addEventListener('DOMContentLoaded', () => {
    // Initial load of dashboard
    loadDashboard();

    document.getElementById('dashboardLink').addEventListener('click', (e) => {
        e.preventDefault();
        loadDashboard();
    });

    document.getElementById('productsLink').addEventListener('click', (e) => {
        e.preventDefault();
        loadProducts();
    });

    document.getElementById('customersLink').addEventListener('click', (e) => {
        e.preventDefault();
        loadCustomers();
    });

    document.getElementById('ordersLink').addEventListener('click', (e) => {
        e.preventDefault();
        loadOrders();
    });
});
