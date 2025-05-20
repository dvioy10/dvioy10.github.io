// Clase para manejar el carrito de compras
class ShoppingCart {
    constructor() {
        // Cargar items del localStorage
        const savedCart = localStorage.getItem('cart');
        try {
            this.items = savedCart ? JSON.parse(savedCart) : [];
            console.log('Loaded cart items:', this.items);
        } catch (error) {
            console.error('Error parsing cart:', error);
            this.items = [];
        }

        // Inicializar elementos del DOM
        this.cartContent = document.querySelector('.cart-content');
        this.emptyCartMessage = document.querySelector('.empty-cart-message');
        this.cartItems = document.querySelector('.cart-items');
        
        // Inicializar la visualización del carrito
        this.updateCartDisplay();
        this.updateCartCount();
    }

    // Actualizar el contador del carrito
    updateCartCount() {
        const cartCount = document.querySelector('.cart-count');
        if (cartCount) {
            const totalItems = this.items.reduce((total, item) => total + item.quantity, 0);
            cartCount.textContent = totalItems;
            cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
            console.log('Cart count updated:', totalItems);
        }
    }

    // Agregar item al carrito
    addItem(product) {
        console.log('Adding product to cart:', product);
        const existingItem = this.items.find(item => item.id === product.id);
        
        if (existingItem) {
            existingItem.quantity += 1;
            console.log('Updated existing item quantity:', existingItem);
        } else {
            this.items.push({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                quantity: 1
            });
            console.log('Added new item to cart');
        }
        
        this.saveCart();
        this.updateCartDisplay();
        this.updateCartCount();
    }

    // Remover item del carrito
    removeItem(productId) {
        this.items = this.items.filter(item => item.id !== productId);
        this.saveCart();
        this.updateCartDisplay();
        this.updateCartCount();
    }

    // Actualizar cantidad de un item
    updateQuantity(productId, quantity) {
        const item = this.items.find(item => item.id === productId);
        if (item) {
            item.quantity = Math.max(1, quantity);
            this.saveCart();
            this.updateCartDisplay();
            this.updateCartCount();
        }
    }

    // Guardar carrito en localStorage
    saveCart() {
        const cartData = JSON.stringify(this.items);
        console.log('Saving cart to localStorage:', cartData);
        localStorage.setItem('cart', cartData);
    }

    // Calcular subtotal
    calculateSubtotal() {
        return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    // Calcular IVA
    calculateIVA() {
        return this.calculateSubtotal() * 0.19;
    }

    // Calcular total
    calculateTotal() {
        return this.calculateSubtotal() + this.calculateIVA();
    }

    // Función para formatear precio en CLP
    formatearPrecioCLP(precio) {
        return new Intl.NumberFormat('es-CL', {
            style: 'currency',
            currency: 'CLP',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(precio);
    }

    // Actualizar la visualización del carrito
    updateCartDisplay() {
        console.log('Updating cart display. Items:', this.items);
        
        if (this.items.length === 0) {
            console.log('Cart is empty, showing empty message');
            if (this.cartContent) this.cartContent.style.display = 'none';
            if (this.emptyCartMessage) this.emptyCartMessage.style.display = 'block';
            return;
        }

        console.log('Cart has items, updating display');
        if (this.cartContent) this.cartContent.style.display = 'flex';
        if (this.emptyCartMessage) this.emptyCartMessage.style.display = 'none';

        // Actualizar lista de items
        if (this.cartItems) {
            const itemsHTML = this.items.map(item => `
                <div class="cart-item" data-id="${item.id}">
                    <img src="${item.image}" alt="${item.name}" class="cart-item-image">
                    <div class="cart-item-details">
                        <h3 class="cart-item-title">${item.name}</h3>
                        <p class="cart-item-price">${this.formatearPrecioCLP(item.price)}</p>
                        <div class="cart-item-quantity">
                            <button class="quantity-btn decrease">-</button>
                            <input type="number" class="quantity-input" value="${item.quantity}" min="1">
                            <button class="quantity-btn increase">+</button>
                        </div>
                    </div>
                    <button class="remove-item">×</button>
                </div>
            `).join('');
            
            console.log('Generated HTML for items:', itemsHTML);
            this.cartItems.innerHTML = itemsHTML;
        }

        // Actualizar resumen
        const subtotal = this.calculateSubtotal();
        const iva = this.calculateIVA();
        const total = this.calculateTotal();

        const subtotalElement = document.getElementById('subtotal');
        const ivaElement = document.getElementById('iva');
        const totalElement = document.getElementById('total');

        if (subtotalElement) subtotalElement.textContent = this.formatearPrecioCLP(subtotal);
        if (ivaElement) ivaElement.textContent = this.formatearPrecioCLP(iva);
        if (totalElement) totalElement.textContent = this.formatearPrecioCLP(total);

        // Agregar event listeners
        this.addEventListeners();
    }

    // Agregar event listeners a los elementos del carrito
    addEventListeners() {
        // Botones de cantidad
        document.querySelectorAll('.quantity-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const cartItem = e.target.closest('.cart-item');
                const productId = cartItem.dataset.id;
                const input = cartItem.querySelector('.quantity-input');
                const currentValue = parseInt(input.value);

                if (e.target.classList.contains('increase')) {
                    this.updateQuantity(productId, currentValue + 1);
                } else if (e.target.classList.contains('decrease')) {
                    this.updateQuantity(productId, currentValue - 1);
                }
            });
        });

        // Input de cantidad
        document.querySelectorAll('.quantity-input').forEach(input => {
            input.addEventListener('change', (e) => {
                const cartItem = e.target.closest('.cart-item');
                const productId = cartItem.dataset.id;
                const newValue = parseInt(e.target.value);
                this.updateQuantity(productId, newValue);
            });
        });

        // Botones de eliminar
        document.querySelectorAll('.remove-item').forEach(button => {
            button.addEventListener('click', (e) => {
                const cartItem = e.target.closest('.cart-item');
                const productId = cartItem.dataset.id;
                this.removeItem(productId);
            });
        });
    }

    // Limpiar carrito
    clearCart() {
        this.items = [];
        this.saveCart();
        this.updateCartDisplay();
    }
}

// Inicializar el carrito cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing cart');
    const cart = new ShoppingCart();

    // Event listener para el botón de checkout
    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            if (cart.items.length > 0) {
                document.querySelector('.cart-content').style.display = 'none';
                document.getElementById('payment-form').style.display = 'block';
            }
        });
    }
});

// Agregar esto al final del archivo para debugging
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initial localStorage cart:', localStorage.getItem('cart'));
    const cart = new ShoppingCart();
});

// Funciones de validación
function validarNombre(nombre) {
    return /^[A-Z][a-záéíóúüñÁÉÍÓÚÜÑ\s]*$/.test(nombre);
}

function validarTarjeta(tarjeta) {
    return /^\d{16}$/.test(tarjeta);
}

function validarFecha(fecha) {
    return /^(0[1-9]|1[0-2])\/([0-9]{2})$/.test(fecha);
}

function validarCVV(cvv) {
    return /^\d{3}$/.test(cvv);
}

// Mostrar/ocultar formulario de pago
document.getElementById('checkout-btn').addEventListener('click', function() {
    document.querySelector('.cart-content').style.display = 'none';
    document.getElementById('payment-form').style.display = 'block';
});

document.getElementById('cancel-payment').addEventListener('click', function() {
    document.getElementById('payment-form').style.display = 'none';
    document.querySelector('.cart-content').style.display = 'flex';
});

// Validación en tiempo real
document.getElementById('nombre').addEventListener('input', function(e) {
    const nombre = e.target.value;
    const errorElement = document.getElementById('nombre-error');
    
    if (!validarNombre(nombre)) {
        errorElement.textContent = 'El nombre debe comenzar con mayúscula y contener solo letras';
        e.target.classList.add('error');
    } else {
        errorElement.textContent = '';
        e.target.classList.remove('error');
    }
});

document.getElementById('apellido').addEventListener('input', function(e) {
    const apellido = e.target.value;
    const errorElement = document.getElementById('apellido-error');
    
    if (!validarNombre(apellido)) {
        errorElement.textContent = 'El apellido debe comenzar con mayúscula y contener solo letras';
        e.target.classList.add('error');
    } else {
        errorElement.textContent = '';
        e.target.classList.remove('error');
    }
});

document.getElementById('tarjeta').addEventListener('input', function(e) {
    const tarjeta = e.target.value.replace(/\D/g, '');
    e.target.value = tarjeta;
    const errorElement = document.getElementById('tarjeta-error');
    
    if (!validarTarjeta(tarjeta)) {
        errorElement.textContent = 'La tarjeta debe tener 16 dígitos';
        e.target.classList.add('error');
    } else {
        errorElement.textContent = '';
        e.target.classList.remove('error');
    }
});

document.getElementById('fecha').addEventListener('input', function(e) {
    let fecha = e.target.value.replace(/\D/g, '');
    if (fecha.length >= 2) {
        fecha = fecha.slice(0,2) + '/' + fecha.slice(2);
    }
    e.target.value = fecha;
    const errorElement = document.getElementById('fecha-error');
    
    if (!validarFecha(fecha)) {
        errorElement.textContent = 'Formato inválido. Use MM/AA';
        e.target.classList.add('error');
    } else {
        errorElement.textContent = '';
        e.target.classList.remove('error');
    }
});

document.getElementById('cvv').addEventListener('input', function(e) {
    const cvv = e.target.value.replace(/\D/g, '');
    e.target.value = cvv;
    const errorElement = document.getElementById('cvv-error');
    
    if (!validarCVV(cvv)) {
        errorElement.textContent = 'El CVV debe tener 3 dígitos';
        e.target.classList.add('error');
    } else {
        errorElement.textContent = '';
        e.target.classList.remove('error');
    }
});

// Manejo del envío del formulario
document.getElementById('credit-card-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const nombre = document.getElementById('nombre').value;
    const apellido = document.getElementById('apellido').value;
    const tarjeta = document.getElementById('tarjeta').value;
    const fecha = document.getElementById('fecha').value;
    const cvv = document.getElementById('cvv').value;
    
    if (!validarNombre(nombre) || !validarNombre(apellido) || 
        !validarTarjeta(tarjeta) || !validarFecha(fecha) || !validarCVV(cvv)) {
        alert('Por favor, corrija los errores en el formulario antes de continuar.');
        return;
    }
    
    // Procesar el pago exitosamente
    alert('¡Gracias por su compra! Su pedido ha sido procesado con éxito.');
    localStorage.removeItem('cart'); // Limpiar el carrito
    window.location.href = 'index.html'; // Redirigir a la página principal
});