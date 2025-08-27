// --- Lógica de Navegación y Toggle --- 
document.addEventListener('DOMContentLoaded', () => {
    const principal = document.querySelector('.principal');

    document.body.addEventListener('click', (e) => {
        const navLink = e.target.closest('.navegacion li a');
        if (navLink) {
            e.preventDefault();
            document.querySelectorAll('.navegacion li').forEach(item => item.classList.remove('hovered'));
            navLink.closest('li').classList.add('hovered');

            switch (navLink.id) {
                case 'dashboardLink': loadDashboard(); break;
                case 'productsLink': loadProducts(); break;
                case 'customersLink': loadCustomers(); break;
                case 'ordersLink': loadOrders(); break;
            }
        }

        if (e.target.closest('.toggle')) {
            document.querySelector('.navegacion').classList.toggle('active');
            principal.classList.toggle('active');
        }

        if (e.target.id === 'ordersLinkFromDashboard') {
            e.preventDefault();
            loadOrders();
        }
        
        const modal = document.getElementById('mainModal');
        if (modal && (e.target.matches('.modal') || e.target.matches('.close-button') || e.target.matches('.btn-cancelar'))) {
            modal.style.display = 'none';
        }
    });

    loadDashboard();
});

// --- Contenedor Principal y Utilidades --- 
const API_BASE_URL = 'http://localhost:3000/api';

function getPrincipalContainer() {
    return document.querySelector('.principal');
}

function renderMainLayout(title, buttonText, tableHeaders) {
    getPrincipalContainer().innerHTML = `
        <div class="barrasuperior"><div class="toggle"><i class="fa-solid fa-bars"></i></div></div>
        <div class="detalles">
            <div class="ordenesRecientes">
                <div class="encabezado">
                    <h2>${title}</h2>
                    <a href="#" class="boton" id="addNewBtn">${buttonText}</a>
                </div>
                <table id="mainTable"><thead><tr>${tableHeaders}</tr></thead><tbody></tbody></table>
            </div>
        </div>
        <div id="mainModal" class="modal"><div class="modal-content"><span class="close-button">&times;</span><h2 id="modalTitle"></h2><div id="modalBody"></div></div></div>`;
}

async function apiCall(endpoint, method = 'GET', body = null) {
    try {
        const options = {
            method,
            headers: { 'Content-Type': 'application/json' }
        };
        if (body) {
            options.body = JSON.stringify(body);
        }
        const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Error en la petición a la API');
        }
        return response.status !== 204 ? await response.json() : null;
    } catch (error) {
        console.error(`Error en API call [${method}] ${endpoint}:`, error);
        alert(`Error: ${error.message}`);
        throw error;
    }
}

// --- Dashboard --- 
async function loadDashboard() {
    // (Se asume que la lógica del dashboard está completa y funciona)
    getPrincipalContainer().innerHTML = `
    <div class="barrasuperior"><div class="toggle"><i class="fa-solid fa-bars"></i></div></div>
    <div class="cards">
        <div class="card"><div><div class="numeros">1,504</div><div class="cardName">Visitas Diarias</div></div><div class="iconBox"><i class="fa-regular fa-eye"></i></div></div>
        <div class="card"><div><div class="numeros">80</div><div class="cardName">Ventas</div></div><div class="iconBox"><i class="fa-solid fa-cart-shopping"></i></div></div>
        <div class="card"><div><div class="numeros">284</div><div class="cardName">Comentarios</div></div><div class="iconBox"><i class="fa-regular fa-comments"></i></div></div>
        <div class="card"><div><div class="numeros">$7,842</div><div class="cardName">Facturación</div></div><div class="iconBox"><i class="fa-solid fa-sack-dollar"></i></div></div>
    </div>
    <div class="detalles">
        <div class="ordenesRecientes">
            <div class="encabezado"><h2>Pedidos Recientes</h2><a href="#" id="ordersLinkFromDashboard" class="boton">Ver Todo</a></div>
            <table><thead><tr><td>Nombre</td><td>Precio</td><td>Forma de Pago</td><td>Estado</td></tr></thead>
            <tbody><tr><td>Heladera</td><td>$1200</td><td>Contado</td><td><span class="estado Entregado">Entregado</span></td></tr></tbody>
            </table>
        </div>
        <div class="clientesNuevos"> <div class="cards"><h2>Clientes Nuevos</h2></div><table><tbody><tr><td width="60px"><div class="imgBx"><img src="./imgs/perfil2.jpg"></div></td><td><h4>David<br><span>Italia</span></h4></td></tr></tbody></table></div>
    </div>`;
}

// --- Lógica CRUD Genérica para Modal ---
function setupModalCrud(section, renderTable, renderModal) {
    const principal = getPrincipalContainer();
    const modal = document.getElementById('mainModal');

    principal.addEventListener('click', async (e) => {
        const target = e.target;
        if (target.id === 'addNewBtn') {
            renderModal();
        }
        if (target.classList.contains('btn-edit')) {
            const id = target.dataset.id;
            const data = await apiCall(`/${section}/${id}`);
            renderModal(data[section.slice(0, -1)]);
        }
        if (target.classList.contains('btn-delete')) {
            const id = target.dataset.id;
            if (confirm(`¿Estás seguro de que quieres eliminar este elemento?`)) {
                await apiCall(`/${section}/${id}`, 'DELETE');
                renderTable();
            }
        }
    });

    modal.addEventListener('submit', async (e) => {
        e.preventDefault();
        const form = e.target;
        if (form.tagName !== 'FORM') return;

        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        const id = data.id;

        const method = id ? 'PUT' : 'POST';
        const endpoint = `/${section}${id ? `/${id}` : ''}`;

        try {
            await apiCall(endpoint, method, data);
            modal.style.display = 'none';
            renderTable();
        } catch (error) {
            // El error ya se muestra en apiCall
        }
    });
}

// --- Productos ---
async function loadProducts() {
    renderMainLayout('Lista de Productos', 'Añadir Producto', '<td>ID</td><td>Nombre</td><td>Precio</td><td>Stock</td><td>Acciones</td>');
    const tableBody = document.querySelector('#mainTable tbody');

    const renderProductTable = async () => {
        const { products } = await apiCall('/products');
        tableBody.innerHTML = '';
        products.forEach(p => {
            const row = tableBody.insertRow();
            row.innerHTML = `
                <td>${p.id}</td>
                <td>${p.name}</td>
                <td>$ ${p.price.toFixed(2)}</td>
                <td>${p.stock}</td>
                <td>
                    <button class="btn-edit" data-id="${p.id}">Editar</button>
                    <button class="btn-delete" data-id="${p.id}">Eliminar</button>
                </td>`;
        });
    };

    await renderProductTable();
    setupModalCrud('products', renderProductTable, renderProductModal);
}

function renderProductModal(product = {}) {
    const isEdit = !!product.id;
    const modal = document.getElementById('mainModal');
    document.getElementById('modalTitle').textContent = `${isEdit ? 'Editar' : 'Añadir'} Producto`;
    document.getElementById('modalBody').innerHTML = `
        <form id="productForm">
            <input type="hidden" name="id" value="${product.id || ''}">
            <div class="form-group"><label>Nombre:</label><input type="text" name="name" value="${product.name || ''}" required></div>
            <div class="form-group"><label>Descripción:</label><textarea name="description">${product.description || ''}</textarea></div>
            <div class="form-group"><label>Precio:</label><input type="number" name="price" value="${product.price || ''}" step="0.01" required></div>
            <div class="form-group"><label>Stock:</label><input type="number" name="stock" value="${product.stock || ''}" required></div>
            <div class="modal-footer">
                <button type="button" class="btn-cancelar">Cancelar</button>
                <button type="submit" class="btn-guardar">${isEdit ? 'Actualizar' : 'Guardar'}</button>
            </div>
        </form>`;
    modal.style.display = 'block';
}

// --- Clientes ---
async function loadCustomers() {
    renderMainLayout('Lista de Clientes', 'Añadir Cliente', '<td>ID</td><td>Nombre</td><td>Email</td><td>Teléfono</td><td>Acciones</td>');
    const tableBody = document.querySelector('#mainTable tbody');

    const renderCustomerTable = async () => {
        const { customers } = await apiCall('/customers');
        tableBody.innerHTML = '';
        customers.forEach(c => {
            const row = tableBody.insertRow();
            row.innerHTML = `
                <td>${c.id}</td>
                <td>${c.name}</td>
                <td>${c.email || ''}</td>
                <td>${c.phone || ''}</td>
                <td>
                    <button class="btn-edit" data-id="${c.id}">Editar</button>
                    <button class="btn-delete" data-id="${c.id}">Eliminar</button>
                </td>`;
        });
    };

    await renderCustomerTable();
    setupModalCrud('customers', renderCustomerTable, renderCustomerModal);
}

function renderCustomerModal(customer = {}) {
    const isEdit = !!customer.id;
    const modal = document.getElementById('mainModal');
    document.getElementById('modalTitle').textContent = `${isEdit ? 'Editar' : 'Añadir'} Cliente`;
    document.getElementById('modalBody').innerHTML = `
        <form id="customerForm">
            <input type="hidden" name="id" value="${customer.id || ''}">
            <div class="form-group"><label>Nombre:</label><input type="text" name="name" value="${customer.name || ''}" required></div>
            <div class="form-group"><label>Email:</label><input type="email" name="email" value="${customer.email || ''}"></div>
            <div class="form-group"><label>Teléfono:</label><input type="text" name="phone" value="${customer.phone || ''}"></div>
            <div class="form-group"><label>Dirección:</label><textarea name="address">${customer.address || ''}</textarea></div>
            <div class="modal-footer">
                <button type="button" class="btn-cancelar">Cancelar</button>
                <button type="submit" class="btn-guardar">${isEdit ? 'Actualizar' : 'Guardar'}</button>
            </div>
        </form>`;
    modal.style.display = 'block';
}

// --- Pedidos ---
async function loadOrders() {
    renderMainLayout('Lista de Pedidos', 'Añadir Pedido', '<td>N° Pedido</td><td>Cliente</td><td>Fecha</td><td>Total</td><td>Forma de Pago</td><td>Estado</td><td>Acciones</td>');
    const tableBody = document.querySelector('#mainTable tbody');
    const modal = document.getElementById('mainModal');
    let currentOrderItems = [];
    let customers = [];
    let products = [];

    const renderOrderTable = async () => {
        const { orders } = await apiCall('/orders');
        tableBody.innerHTML = '';
        orders.forEach(o => {
            const row = tableBody.insertRow();
            row.innerHTML = `
                <td>${o.numero_pedido}</td>
                <td>${o.customer_name}</td>
                <td>${new Date(o.order_date).toLocaleDateString()}</td>
                <td>$ ${o.total_amount.toFixed(2)}</td>
                <td>${o.forma_pago}</td>
                <td><span class="estado ${o.status.replace(' ', '')}">${o.status}</span></td>
                <td>
                    <button class="btn-view" data-id="${o.id}">Ver</button>
                    <button class="btn-delete" data-id="${o.id}">Eliminar</button>
                </td>`;
        });
    };

    const renderOrderModal = (order) => {
        currentOrderItems = order ? order.details.map(d => ({ product_id: d.product_id, quantity: d.quantity })) : [];
        const isView = !!order;

        document.getElementById('modalTitle').textContent = isView ? `Detalles del Pedido: ${order.numero_pedido}` : 'Añadir Nuevo Pedido';
        let formHtml = '';
        if (!isView) {
            formHtml = `
            <form id="orderForm">
                <div class="form-group"><label>Cliente:</label><select name="customer_id" required>${customers.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}</select></div>
                <div class="form-group"><label>Forma de Pago:</label><select name="forma_pago" required><option>Contado</option><option>Tarjeta</option><option>Transferencia</option></select></div>
                <div class="form-group"><label>Estado:</label><select name="status" required><option>Pendiente</option><option>En Progreso</option><option>Completado</option><option>Cancelado</option></select></div>
            </form>
            <hr>
            <h3>Añadir Productos</h3>
            <div class="add-item-form">
                <select id="productSelectItem">${products.map(p => `<option value="${p.id}">${p.name} ($${p.price.toFixed(2)})</option>`).join('')}</select>
                <input type="number" id="productQuantityInput" min="1" value="1">
                <button id="addOrderItemBtn" class="boton">Añadir</button>
            </div>`;
        }

        document.getElementById('modalBody').innerHTML = `
            ${formHtml}
            <table id="currentOrderItemsTable">
                <thead><tr><th>Producto</th><th>Cantidad</th><th>Precio Unit.</th><th>Subtotal</th><th>${isView ? '' : 'Acción'}</th></tr></thead>
                <tbody></tbody>
            </table>
            <div class="total-container">Total: <span id="orderTotal">$ 0.00</span></div>
            <div class="modal-footer">
                <button type="button" class="btn-cancelar">Cerrar</button>
                ${!isView ? '<button type="submit" form="orderForm" class="btn-guardar">Guardar Pedido</button>' : ''}
            </div>`;
        
        updateCurrentOrderTable(isView);
        modal.style.display = 'block';
    };

    const updateCurrentOrderTable = (isView = false) => {
        const itemsTableBody = document.getElementById('currentOrderItemsTable')?.querySelector('tbody');
        const totalSpan = document.getElementById('orderTotal');
        if (!itemsTableBody || !totalSpan) return;
        let total = 0;
        itemsTableBody.innerHTML = '';
        currentOrderItems.forEach((item, index) => {
            const product = products.find(p => p.id === item.product_id);
            if (!product) return;
            const subtotal = product.price * item.quantity;
            total += subtotal;
            const row = itemsTableBody.insertRow();
            row.innerHTML = `
                <td>${product.name}</td>
                <td>${item.quantity}</td>
                <td>$ ${product.price.toFixed(2)}</td>
                <td>$ ${subtotal.toFixed(2)}</td>
                ${!isView ? `<td><button class="btn-remove-item" data-index="${index}">Quitar</button></td>` : ''}`;
        });
        totalSpan.textContent = `$ ${total.toFixed(2)}`;
    };

    // Listeners para Pedidos
    getPrincipalContainer().addEventListener('click', async e => {
        if (e.target.id === 'addNewBtn') renderOrderModal();
        if (e.target.classList.contains('btn-view')) {
            const { order } = await apiCall(`/orders/${e.target.dataset.id}`);
            const { products: allProducts } = await apiCall('/products');
            products = allProducts;
            renderOrderModal(order);
        }
        if (e.target.classList.contains('btn-delete')) {
             if (confirm('¿Estás seguro de que quieres eliminar este pedido?')) {
                await apiCall(`/orders/${e.target.dataset.id}`, 'DELETE');
                renderOrderTable();
            }
        }
    });

    modal.addEventListener('click', e => {
        if (e.target.id === 'addOrderItemBtn') {
            const productSelect = document.getElementById('productSelectItem');
            const quantityInput = document.getElementById('productQuantityInput');
            const productId = parseInt(productSelect.value, 10);
            const quantity = parseInt(quantityInput.value, 10);
            if (!productId || !quantity) return;

            const existingItem = currentOrderItems.find(item => item.product_id === productId);
            if (existingItem) existingItem.quantity += quantity; else currentOrderItems.push({ product_id: productId, quantity });
            updateCurrentOrderTable();
            quantityInput.value = 1;
        }
        if (e.target.classList.contains('btn-remove-item')) {
            currentOrderItems.splice(e.target.dataset.index, 1);
            updateCurrentOrderTable();
        }
    });

    modal.addEventListener('submit', async e => {
        if (e.target.id !== 'orderForm') return;
        e.preventDefault();
        if (currentOrderItems.length === 0) return alert('Debe añadir al menos un producto.');
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
        data.items = currentOrderItems;
        await apiCall('/orders', 'POST', data);
        modal.style.display = 'none';
        renderOrderTable();
    });

    // Carga de datos inicial
    const { customers: c } = await apiCall('/customers');
    const { products: p } = await apiCall('/products');
    customers = c;
    products = p;
    await renderOrderTable();
}