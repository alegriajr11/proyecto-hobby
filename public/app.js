// public/app.js
async function fetchComments(){
  try {
    const res = await fetch('/api/comments');
    if (!res.ok) {
      console.error('Error al cargar comentarios:', res.status);
      return;
    }
    const data = await res.json();
    renderList(document.getElementById('all-list'), data.all);
    renderList(document.getElementById('mine-list'), data.mine);
  } catch (error) {
    console.error('Error al cargar comentarios:', error);
  }
}

function renderList(ul, items){
  if (!ul) {
    console.error('Elemento ul no encontrado');
    return;
  }
  
  ul.innerHTML = '';
  if (!items || items.length === 0){
    ul.innerHTML = '<li class="empty">Sin comentarios aún.</li>';
    return;
  }
  
  // Ordenar por fecha (más recientes primero)
  const sortedItems = items.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  
  sortedItems.forEach(c => {
    const li = document.createElement('li');
    const date = new Date(c.createdAt);
    li.innerHTML = `
      <div class="meta">${c.author} • ${date.toLocaleString()}</div>
      <div class="text">${c.text}</div>
    `;
    ul.appendChild(li);
  });
}

// Manejo del formulario
document.getElementById('comment-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.currentTarget;
  const author = form.author.value.trim();
  const text = form.text.value.trim();
  
  if (!author || !text){
    alert('Por favor completa autor y comentario.');
    return;
  }
  
  // Deshabilitar el botón para evitar envíos múltiples
  const submitBtn = form.querySelector('button[type="submit"]');
  const originalText = submitBtn.textContent;
  submitBtn.disabled = true;
  submitBtn.textContent = 'Publicando...';
  
  try {
    const res = await fetch('/api/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ author, text })
    });
    
    if (res.ok){
      form.reset();
      await fetchComments(); // Recargar comentarios
      // Mostrar mensaje de éxito
      showMessage('¡Comentario publicado exitosamente!', 'success');
    } else {
      const data = await res.json().catch(() => ({}));
      showMessage(data.message || 'Error al publicar el comentario.', 'error');
    }
  } catch (error) {
    console.error('Error al enviar comentario:', error);
    showMessage('Error de conexión. Inténtalo de nuevo.', 'error');
  } finally {
    // Rehabilitar el botón
    submitBtn.disabled = false;
    submitBtn.textContent = originalText;
  }
});

// Función para mostrar mensajes al usuario
function showMessage(message, type = 'info') {
  // Crear elemento de mensaje
  const messageEl = document.createElement('div');
  messageEl.className = `message message-${type}`;
  messageEl.textContent = message;
  
  // Agregar estilos
  messageEl.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 12px 16px;
    border-radius: 8px;
    color: white;
    font-weight: 500;
    z-index: 1000;
    max-width: 300px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    ${type === 'success' ? 'background: #10b981;' : 'background: #ef4444;'}
  `;
  
  document.body.appendChild(messageEl);
  
  // Remover después de 3 segundos
  setTimeout(() => {
    if (messageEl.parentNode) {
      messageEl.parentNode.removeChild(messageEl);
    }
  }, 3000);
}

// Inicialización cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  // Cargar comentarios al inicio
  fetchComments();
  
  // Agregar navegación suave entre secciones
  document.querySelectorAll('.tabs a').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('href').substring(1);
      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
});
