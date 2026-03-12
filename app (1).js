// --- 1. CONFIGURACIÓN DE FIREBASE ---
const firebaseConfig = {
  apiKey: "AIzaSyA5rVhtkVDeJPY0bEnLjk-_LMVN3d5pkIo",
  authDomain: "glpi-tecnologia.firebaseapp.com",
  projectId: "glpi-tecnologia",
  storageBucket: "glpi-tecnologia.firebasestorage.app",
  messagingSenderId: "195664374847",
  appId: "1:195664374847:web:88412be75b4ff8600adc8a",
  measurementId: "G-QJD3VS1V5Y"
};

// --- 2. INICIALIZACIÓN DE FIREBASE ---
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();
window.jsPDF = window.jspdf.jsPDF;

// --- 3. TEMPLATES HTML ---
const dashboardHTML = `<h1>📊 Dashboard</h1><div class="dashboard-stats" id="dashboard-cards"></div><div class="card" style="margin-top: 30px;"><h2>Tickets por Día (Últimos 7 días)</h2><div class="chart-container"><canvas id="ticketsChart"></canvas></div></div>`;
const newTITicketFormHTML = `<h1>➕ Crear Nuevo Ticket de TI</h1><div class="card"><form id="new-ticket-form"><div class="form-group"><label for="title">Título</label><input type="text" id="title" required></div><div class="form-group"><label>Descripción</label><div id="description-editor"></div></div><div class="inventory-form-grid"><div class="form-group"><label for="requester">Solicitante</label><select id="requester" required></select></div><div class="form-group"><label for="location">Ubicación</label><select id="location" required></select></div><div class="form-group"><label for="priority">Prioridad</label><select id="priority"><option value="baja">Baja</option><option value="media">Media</option><option value="alta">Alta</option></select></div><div class="form-group"><label for="ticket-datetime">Fecha y Hora del Ticket</label><input type="datetime-local" id="ticket-datetime" required></div></div><div class="form-group"><label>Dispositivos Asociados (opcional)</label><div id="associated-devices-container"><div class="device-input-group"><input type="text" class="device-search" list="device-list" placeholder="Busca por código, usuario, marca..."><button type="button" class="add-device-btn">+</button></div></div><datalist id="device-list"></datalist></div><button type="submit" class="primary">Crear Ticket</button></form></div>`;
const newPlatformTicketFormHTML = `<h1 id="page-title"></h1><div class="card"><form id="new-platform-ticket-form"><div class="inventory-form-grid"><div class="form-group"><label for="fecha-reporte">Fecha de Reporte</label><input type="date" id="fecha-reporte" required></div><div class="form-group"><label for="hora-reporte">Hora de Reporte</label><input type="time" id="hora-reporte" required></div><div class="form-group"><label for="medio-solicitud">Medio de Solicitud</label><select id="medio-solicitud" required></select></div><div class="form-group"><label for="solicitante">Solicitante</label><select id="solicitante" required></select></div><div class="form-group"><label for="asesor-soporte">Asesor de Soporte</label><input type="text" id="asesor-soporte" required></div><div class="form-group"><label for="ticket-caso">Ticket del Caso</label><input type="text" id="ticket-caso"></div></div><div class="form-group"><label for="descripcion-novedad">Descripción de la Novedad</label><textarea id="descripcion-novedad" rows="4" required></textarea></div><button type="submit" class="primary">Crear Ticket</button></form></div>`;
const ticketListHTML = `<div class="add-new-button-container"><button class="export-btn csv" data-format="csv">Exportar a Excel (CSV)</button><button class="export-btn pdf" data-format="pdf">Exportar a PDF</button></div><div class="card"><h2 id="tickets-list-title">Todos los Tickets</h2><div class="table-wrapper"><table id="data-table"><thead><tr><th># Ticket</th><th>Tipo</th><th>Título/Novedad</th><th>Solicitante</th><th>Fecha Creación</th><th>Fecha Cierre</th><th>Estado</th><th>Acciones</th></tr></thead><tbody></tbody></table></div></div>`;
const historyPageHTML = `<h1>🔍 Historial y Búsqueda Avanzada</h1><div class="card"><form id="history-search-form"><div class="search-filters-grid"><div class="form-group"><label for="search-device">Dispositivo (por código)</label><input type="text" id="search-device" list="device-list-search" placeholder="Buscar por código..."></div><datalist id="device-list-search"></datalist><div class="form-group"><label for="search-requester">Solicitante</label><select id="search-requester"><option value="">Todos</option></select></div><div class="form-group"><label for="search-location">Ubicación</label><select id="search-location"><option value="">Todas</option></select></div><div class="form-group"><label for="search-status">Estado</label><select id="search-status"><option value="">Todos</option><option value="abierto">Abierto</option><option value="en-curso">En curso</option><option value="cerrado">Cerrado</option></select></div><div class="form-group"><label for="search-priority">Prioridad</label><select id="search-priority"><option value="">Todas</option><option value="baja">Baja</option><option value="media">Media</option><option value="alta">Alta</option></select></div><div class="form-group"><label for="search-ticket-type">Tipo de Ticket</label><select id="search-ticket-type"><option value="">Todos</option><option value="ti">TI</option><option value="velocity">Velocity</option><option value="siigo">Siigo</option></select></div><div class="form-group"><label for="search-start-date">Creado Desde</label><input type="date" id="search-start-date"></div><div class="form-group"><label for="search-end-date">Creado Hasta</label><input type="date" id="search-end-date"></div><div class="form-group"><button type="submit" class="primary" style="width:100%">Buscar</button></div></div></form></div><div class="add-new-button-container"><button class="export-btn csv" data-format="csv">Exportar a Excel (CSV)</button><button class="export-btn pdf" data-format="pdf">Exportar a PDF</button></div><div class="card"><h2 id="history-results-title">Resultados</h2><div class="table-wrapper"><table id="data-table"><thead><tr><th># Ticket</th><th>Título</th><th>Tipo</th><th>Ticket del Caso</th><th>Solicitante</th><th>Fecha Creación</th><th>Fecha Cierre</th><th>Estado</th><th>Acciones</th></tr></thead><tbody></tbody></table></div></div>`;
const knowledgeBaseHTML = `<h1>💡 Base de Conocimiento</h1><div class="add-new-button-container"><input type="text" id="kb-search-input" placeholder="🔍 Buscar en artículos y manuales..." style="flex-grow: 1; padding: 12px; border-radius: 8px; border: 1px solid var(--border-color);"><button id="add-manual-btn" class="primary">Crear Manual</button><button id="add-kb-article-btn" class="btn-blue">Crear Artículo</button></div><div id="kb-grid-container" class="kb-grid"></div>`;
const statisticsHTML = `<div style="display: flex; justify-content: space-between; align-items: center;"><h1>📈 Centro de Análisis</h1><button class="primary" id="export-stats-pdf">Exportar a PDF</button></div><div id="stats-content"><div class="card"><h2>Filtro de Periodo</h2><div class="stats-filters"><div class="form-group"><label for="start-date">Fecha de Inicio</label><input type="date" id="start-date"></div><div class="form-group"><label for="end-date">Fecha de Fin</label><input type="date" id="end-date"></div><button id="generate-report-btn" class="primary">Generar Reporte</button></div></div><h2>Análisis de Tickets</h2><div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 25px;"><div class="card"><h3>Tickets por Prioridad</h3><div class="chart-container"><canvas id="ticketsByPriorityChart"></canvas></div></div><div class="card"><h3>Tickets por Categoría de Dispositivo</h3><div class="chart-container"><canvas id="ticketsByDeviceCategoryChart"></canvas></div></div><div class="card"><h3>Top 5 Dispositivos Problemáticos</h3><ul id="top-devices-list" class="kpi-list"></ul></div><div class="card"><h3>Top 5 Solicitantes</h3><ul id="top-requesters-list" class="kpi-list"></ul></div></div><div class="card"><h3>Flujo de Tickets (Creados vs. Cerrados)</h3><div class="chart-container"><canvas id="ticket-flow-chart"></canvas></div></div><h2 style="margin-top: 40px;">Resumen de Inventario</h2><div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 25px;"><div class="card"><h3>Dispositivos por Categoría</h3><div class="chart-container"><canvas id="inventoryByCategoryChart"></canvas></div></div><div class="card"><h3>Computadores por SO</h3><div class="chart-container"><canvas id="computersByOsChart"></canvas></div></div></div></div>`;
const genericListPageHTML = `<h1 id="page-title"></h1><div class="add-new-button-container"><button class="export-btn csv" data-format="csv">Exportar a Excel (CSV)</button><button class="export-btn pdf" data-format="pdf">Exportar a PDF</button><button id="add-item-btn" class="btn-blue open-form-modal-btn">Añadir Nuevo</button></div><div class="card"><div class="table-search-container"><input type="text" id="table-search-input" placeholder="🔍 Buscar en la tabla..."></div><h2 id="item-list-title"></h2><div class="table-wrapper"><table id="data-table"><thead id="item-table-head"></thead><tbody id="item-table-body"></tbody></table></div></div>`;
const maintenanceCalendarHTML = `<h1>📅 Planificación</h1><div class="add-new-button-container"><button class="export-btn csv" data-format="csv">Exportar a Excel (CSV)</button><button class="export-btn pdf" data-format="pdf">Exportar a PDF</button><button class="primary open-form-modal-btn" data-type="maintenance">Programar Tarea</button></div><div class="card"><div id="maintenance-calendar"></div><table id="data-table" style="display:none;"></table></div>`;
const configHTML = `<h1>⚙️ Configuración</h1><div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;"><div class="card"><h2>Gestionar Solicitantes</h2><form id="add-requester-form" style="display:flex; gap:10px; margin-bottom: 20px;"><input type="text" id="requester-name" placeholder="Nombre del solicitante" required style="flex-grow:1;"><button type="submit" class="primary">Añadir</button></form><ul id="requesters-list" class="config-list"></ul></div><div class="card"><h2>Gestionar Ubicaciones</h2><form id="add-location-form" style="display:flex; gap:10px; margin-bottom: 20px;"><input type="text" id="location-name" placeholder="Nombre de la ubicación" required style="flex-grow:1;"><button type="submit" class="primary">Añadir</button></form><ul id="locations-list" class="config-list"></ul></div></div>`;

// --- 4. FUNCIONES DE AYUDA Y CONFIGURACIONES ---
function capitalizar(str) { if (!str) return str; return str.charAt(0).toUpperCase() + str.slice(1); }
function exportToCSV(tableId, filename) { const table = document.getElementById(tableId); if (!table) { console.error("Tabla no encontrada para exportar:", tableId); return; } let data = []; const headers = Array.from(table.querySelectorAll('thead th')).map(header => header.innerText).slice(0, -1); const rows = table.querySelectorAll('tbody tr'); rows.forEach(row => { const rowData = Array.from(row.querySelectorAll('td')).map(cell => cell.innerText).slice(0, -1); data.push(rowData); }); const csv = Papa.unparse({ fields: headers, data }, { delimiter: ";" }); const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' }); const link = document.createElement("a"); if (link.download !== undefined) { const url = URL.createObjectURL(blob); link.setAttribute("href", url); link.setAttribute("download", `${filename}.csv`); link.style.visibility = 'hidden'; document.body.appendChild(link); link.click(); document.body.removeChild(link); } }
function exportToPDF(tableId, filename) { const table = document.getElementById(tableId); if (!table) { console.error("Tabla no encontrada para exportar:", tableId); return; } const doc = new jsPDF({ orientation: "landscape" }); const head = [Array.from(table.querySelectorAll('thead th')).map(header => header.innerText).slice(0, -1)]; const body = Array.from(table.querySelectorAll('tbody tr')).map(row => Array.from(row.querySelectorAll('td')).map(cell => cell.innerText).slice(0, -1)); doc.autoTable({ head: head, body: body, startY: 10, styles: { font: "Inter", fontSize: 8 }, headStyles: { fillColor: [41, 128, 186], textColor: 255, fontStyle: 'bold' } }); doc.save(`${filename}.pdf`); }
async function exportStatsToPDF() { const reportElement = document.getElementById('stats-content'); const canvas = await html2canvas(reportElement, { scale: 2 }); const imgData = canvas.toDataURL('image/png'); const pdf = new jsPDF('p', 'mm', 'a4'); const pdfWidth = pdf.internal.pageSize.getWidth(); const pdfHeight = (canvas.height * pdfWidth) / canvas.width; pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight); pdf.save("reporte-estadisticas.pdf"); }
function setupTableSearch(inputId, tableId) { const searchInput = document.getElementById(inputId); if (!searchInput) return; if (searchInput.dataset.listenerAttached) return; searchInput.dataset.listenerAttached = 'true'; searchInput.addEventListener('input', (e) => { const searchTerm = e.target.value.toLowerCase().trim(); const table = document.getElementById(tableId); const rows = table.querySelectorAll('tbody tr'); rows.forEach(row => { const rowText = row.textContent.toLowerCase(); if (rowText.includes(searchTerm)) { row.style.display = ''; } else { row.style.display = 'none'; } }); }); }

const inventoryCategoryConfig = { computers: { title: 'Computadores', titleSingular: 'Computador', prefix: 'PC-', counter: 'computerCounter', fields: { id: { label: 'Código' }, brand: { label: 'Marca', type: 'text' }, model: { label: 'Modelo', type: 'text' }, serial: { label: 'Serial', type: 'text' }, user: { label: 'Usuario', type: 'text' }, cpu: { label: 'CPU', type: 'text' }, ram: { label: 'RAM (GB)', type: 'text' }, storage: { label: 'Almacenamiento (GB)', type: 'text' }, os: { label: 'Licencia de SO Asignada', type: 'select', optionsSource: 'software-licenses' }, sede: { label: 'Sede', type: 'select', optionsSource: 'locations' }, purchaseDate: { label: 'Fecha de Compra', type: 'date' }, warrantyEndDate: { label: 'Fin de Garantía', type: 'date' }, lifecycleStatus: { label: 'Estado', type: 'select', options: ['En Uso', 'En TI', 'Dañado', 'Retirado'] }, observaciones: { label: 'Observaciones', type: 'textarea' } } }, phones: { title: 'Teléfonos', titleSingular: 'Teléfono', prefix: 'TEL-', counter: 'phoneCounter', fields: { id: { label: 'Código' }, brand: { label: 'Marca', type: 'text' }, model: { label: 'Modelo', type: 'text' }, serial: { label: 'Serial', type: 'text' }, imei: { label: 'IMEI', type: 'text' }, phoneNumber: { label: 'N/Teléfono', type: 'text' }, user: { label: 'Usuario', type: 'text' }, purchaseDate: { label: 'Fecha de Compra', type: 'date' }, warrantyEndDate: { label: 'Fin de Garantía', type: 'date' }, lifecycleStatus: { label: 'Fase del Ciclo de Vida', type: 'select', options: ['Producción', 'En TI', 'En Mantenimiento', 'Retirado'] } } }, cameras: { title: 'Cámaras', titleSingular: 'Cámara', prefix: 'CAM-', counter: 'cameraCounter', fields: { id: { label: 'Código' }, brand: { label: 'Marca', type: 'text' }, model: { label: 'Modelo', type: 'text' }, serial: { label: 'Serial', type: 'text' }, ipAddress: { label: 'Dirección IP', type: 'text' }, location: { label: 'Ubicación Física', type: 'text' } } }, modems: { title: 'Módems', titleSingular: 'Módem', prefix: 'MOD-', counter: 'modemsCounter', fields: { id: { label: 'Código' }, brand: { label: 'Marca', type: 'text' }, model: { label: 'Modelo', type: 'text' }, serial: { label: 'Serial', type: 'text' }, serviceProvider: { label: 'Proveedor de Internet', type: 'text' }, location: { label: 'Ubicación Física', type: 'text' } } }, communicators: { title: 'Comunicadores', titleSingular: 'Comunicador', prefix: 'COM-', counter: 'communicatorsCounter', fields: { id: { label: 'Código' }, brand: { label: 'Marca', type: 'text' }, model: { label: 'Modelo', type: 'text' }, serial: { label: 'Serial', type: 'text' }, type: { label: 'Tipo (Satelital, Radio)', type: 'text' } } }, network: { title: 'Dispositivos de Red', titleSingular: 'Dispositivo de Red', prefix: 'NET-', counter: 'redCounter', fields: { id: { label: 'Código' }, type: { label: 'Tipo (Switch, Router, AP)', type: 'text' }, brand: { label: 'Marca', type: 'text' }, model: { label: 'Modelo', type: 'text' }, ipAddress: { label: 'Dirección IP', type: 'text' }, location: { label: 'Ubicación Física', type: 'text' } } }, printers: { title: 'Impresoras', titleSingular: 'Impresora', prefix: 'IMP-', counter: 'impresoraCounter', fields: { id: { label: 'Código' }, brand: { label: 'Marca', type: 'text' }, model: { label: 'Modelo', type: 'text' }, serial: { label: 'Serial', type: 'text' }, ipAddress: { label: 'Dirección IP', type: 'text' }, type: { label: 'Tipo (Láser, Tinta)', type: 'text' }, location: { label: 'Ubicación Física', type: 'text' } } } };
const servicesCategoryConfig = { internet: { title: 'Internet', titleSingular: 'Servicio de Internet', prefix: 'SRV-INET-', counter: 'internetServiceCounter', fields: { id: { label: 'Código' }, provider: { label: 'Proveedor', type: 'text' }, planName: { label: 'Nombre del Plan', type: 'text' }, contract: { label: 'Contrato', type: 'text' }, speed: { label: 'Velocidad Contratada', type: 'text' }, monthlyCost: { label: 'Costo Mensual', type: 'number' }, location: { label: 'Ubicación', type: 'text' }, status: { label: 'Estado', type: 'select', options: ['Activo', 'Inactivo'] } } }, telefonia: { title: 'Servicios de Telefonía', titleSingular: 'Servicio de Telefonía', prefix: 'SRV-TEL-', counter: 'telefoniaServiceCounter', fields: { id: { label: 'Código' }, provider: { label: 'Proveedor', type: 'text' }, planName: { label: 'Nombre del plan', type: 'text' }, contrac: { label: 'Número de cuenta', type: 'text' }, bill: { label: 'Número de factura', type: 'text' }, linesIncluded: { label: 'Línea', type: 'number' }, monthlyCost: { label: 'Costo mensual', type: 'number' }, assignedUser: { label: 'Usuario asignado', type: 'text' }, status: { label: 'Estado', type: 'select', options: ['Activo', 'Inactivo'] } } }, otros: { title: 'Otros Servicios', titleSingular: 'Otro Servicio', prefix: 'SRV-OTH-', counter: 'otrosServiceCounter', fields: { id: { label: 'Código' }, serviceName: { label: 'Nombre del Servicio', type: 'text' }, provider: { label: 'Proveedor', type: 'text' }, description: { label: 'Descripción', type: 'textarea' }, monthlyCost: { label: 'Costo mensual', type: 'number' }, status: { label: 'Estado', type: 'select', options: ['Activo', 'Inactivo'] } } } };
const credentialsCategoryConfig = {
    emails: { title: 'Correos Electrónicos', titleSingular: 'Credencial de Correo', prefix: 'CRED-EMAIL-', counter: 'emailCounter', fields: { id: { label: 'Código' }, service: { label: 'Servicio (Google, O365)', type: 'text' }, email: { label: 'Correo Electrónico', type: 'email' }, password: { label: 'Contraseña', type: 'text' }, recoveryEmail: { label: 'Correo de recuperación', type: 'email' }, recoveryPhone: { label: 'Número de recuperación', type: 'tel' }, assignedUser: { label: 'Usuario asignado', type: 'text' }, area: { label: 'Área', type: 'text' }, status: { label: 'Estado', type: 'select', options: ['Activo', 'Inactivo'] }, notes: { label: 'Notas', type: 'textarea' } } },
    computers: { title: 'Usuarios de Equipos', titleSingular: 'Usuario de Equipo', prefix: 'CRED-PCUSER-', counter: 'computerUserCounter', fields: { id: { label: 'Código' }, computerId: { label: 'Equipo Asignado', type: 'text', optionsSource: 'computers-inventory', placeholder: 'Busca por código, marca, modelo...' }, username: { label: 'Nombre de Usuario', type: 'text' }, password: { label: 'Contraseña', type: 'text' }, isAdmin: { label: '¿Es Admin?', type: 'select', options: ['No', 'Sí'] } } },
    phones: { title: 'Usuarios de Teléfonos', titleSingular: 'Usuario de Teléfono', prefix: 'CRED-PHUSER-', counter: 'phoneUserCounter', fields: { id: { label: 'Código' }, phoneId: { label: 'ID/Modelo del Teléfono', type: 'text' }, user: { label: 'Usuario Asignado', type: 'text' }, pin: { label: 'PIN/Contraseña', type: 'text' } } },
    internet: { title: 'Usuarios de Internet', titleSingular: 'Acceso a Internet', prefix: 'CRED-INET-', counter: 'internetCounter', fields: { id: { label: 'Código' }, provider: { label: 'Proveedor (ISP)', type: 'text' }, accountId: { label: 'ID de Cuenta/Usuario', type: 'text' }, password: { label: 'Contraseña', type: 'text' } } },
    servers: { title: 'Servidores y BD', titleSingular: 'Acceso a Servidor/BD', prefix: 'CRED-SRV-', counter: 'serverCounter', fields: { id: { label: 'Código' }, host: { label: 'Host/IP', type: 'text' }, port: { label: 'Puerto', type: 'number' }, username: { label: 'Usuario', type: 'text' }, password: { label: 'Contraseña', type: 'text' }, dbName: { label: 'Nombre BD', type: 'text' }, nots: { label: 'Notas', type: 'text' }} },
    software: { title: 'Licencias de Software', titleSingular: 'Licencia de Software', prefix: 'CRED-SW-', counter: 'softwareCounter', fields: { id: { label: 'Código' }, softwareName: { label: 'Nombre del software', type: 'text' }, licenseKey: { label: 'Clave de licencia', type: 'textarea' }, version: { label: 'Versión', type: 'text' }, assignedTo: { label: 'Asignar a Equipo', type: 'select', optionsSource: 'computers-inventory' } } },
    siigo: { title: 'Usuarios Siigo', titleSingular: 'Usuario Siigo', prefix: 'CRED-SIIGO-', counter: 'siigoCounter', fields: { id: { label: 'Código' }, username: { label: 'Usuario', type: 'text' }, password: { label: 'Contraseña', type: 'text' }, assignedUser: { label: 'Ususario asignado', type: 'text' }, url: { label: 'URL de Acceso', type: 'text' }, status: { label: 'Estado', type: 'select', options: ['Activo', 'Inactivo'] }, notes: { label: 'Notas', type: 'textarea' } } },
    velocity: { title: 'Usuarios Velocity', titleSingular: 'Usuario Velocity', prefix: 'CRED-VEL-', counter: 'velocityCounter', fields: { id: { label: 'Código' }, username: { label: 'Usuario', type: 'text' }, password: { label: 'Contraseña', type: 'text' }, assignedUser: { label: 'Usuario asignado', type: 'text' }, url: { label: 'URL de Acceso', type: 'text' }, status: { label: 'Estado', type: 'select', options: ['Activo', 'Inactivo'] }, notes: { label: 'Notas', type: 'textarea' } } },
    traslados: { title: 'Usuarios App Traslados', titleSingular: 'Usuario App Traslados', prefix: 'CRED-APPTR-', counter: 'trasladosCounter', fields: { id: { label: 'Código' }, username: { label: 'Usuario', type: 'text' }, password: { label: 'Contraseña', type: 'text' }, assignedUser: { label: 'Usuario asignado', type: 'text' }, status: { label: 'Estado', type: 'select', options: ['Activo', 'Inactivo'] }, notes: { label: 'Notas', type: 'textarea' } } },
    atencion: { 
        title: 'Usuarios App Atención al Cliente', 
        titleSingular: 'Usuario App Atención al Cliente', 
        prefix: 'CRED-APPAT-', 
        counter: 'atencionCounter', 
        fields: { 
            id: { label: 'Código' }, 
            username: { label: 'Usuario', type: 'text' }, 
            password: { label: 'Contraseña', type: 'text' }, 
            assignedUser: { label: 'Usuario asignado', type: 'text' }, 
            status: { label: 'Estado', type: 'select', options: ['Activo', 'Inactivo'] }, 
            notes: { label: 'Notas', type: 'textarea' } 
        } 
    },
    others: { title: 'Otras Credenciales', titleSingular: 'Credencial', prefix: 'CRED-OTH-', counter: 'otherCredentialCounter', fields: { id: { label: 'Código' }, system: { label: 'Sistema/Servicio', type: 'text' }, url: { label: 'URL (Opcional)', type: 'text' }, username: { label: 'Usuario', type: 'text' }, password: { label: 'Contraseña', type: 'text' }, notes: { label: 'Notas', type: 'textarea' } } }
};
// --- FUNCIONES DE RENDERIZADO ---
function handleFirestoreError(error, element) { console.error("Firestore Error:", error); const indexLinkRegex = /(https:\/\/console\.firebase\.google\.com\/project\/.*?\/firestore\/indexes\?create_composite=.*?)"/; const match = error.message.match(indexLinkRegex); let errorMessageHTML; if (match) { const link = match[1]; errorMessageHTML = `<strong>Error de Firebase:</strong> Se requiere un índice que no existe.<br><br><a href="${link}" target="_blank" style="color:blue; text-decoration:underline;">Haz clic aquí para crear el índice necesario en una nueva pestaña.</a><br><br>Después de crearlo, espera unos minutos y recarga esta página.`; } else { errorMessageHTML = `<strong>Error al cargar los datos:</strong> ${error.message}. <br><br>Esto puede ser causado por la configuración de "Prevención de seguimiento" de tu navegador.`; } element.innerHTML = `<div class="card" style="padding: 20px; border-left: 5px solid red;">${errorMessageHTML}</div>`; }
async function renderDashboard(container) { container.innerHTML = dashboardHTML; const cardsContainer = document.getElementById('dashboard-cards'); cardsContainer.innerHTML = 'Cargando estadísticas...'; const ticketsSnapshot = await db.collection('tickets').get(); const tickets = ticketsSnapshot.docs.map(doc => doc.data()); const openCount = tickets.filter(t => t.status === 'abierto').length; const closedCount = tickets.filter(t => t.status === 'cerrado').length; const totalCount = tickets.length; cardsContainer.innerHTML = `<a href="#tickets?status=abierto" class="stat-card open"><div class="stat-number">${openCount}</div><div class="stat-label">Tickets Abiertos</div></a><a href="#tickets?status=cerrado" class="stat-card closed"><div class="stat-number">${closedCount}</div><div class="stat-label">Tickets Cerrados</div></a><a href="#tickets" class="stat-card all"><div class="stat-number">${totalCount}</div><div class="stat-label">Todos los Tickets</div></a>`; const last7Days = Array(7).fill(0).reduce((acc, _, i) => { const d = new Date(); d.setDate(d.getDate() - i); acc[d.toISOString().split('T')[0]] = 0; return acc; }, {}); tickets.forEach(ticket => { if (ticket.createdAt) { const ticketDate = ticket.createdAt.toDate().toISOString().split('T')[0]; if (last7Days.hasOwnProperty(ticketDate)) { last7Days[ticketDate]++; } } }); const ctx = document.getElementById('ticketsChart').getContext('2d'); new Chart(ctx, { type: 'bar', data: { labels: Object.keys(last7Days).map(d => new Date(d + 'T00:00:00').toLocaleDateString('es-ES', {day:'numeric', month:'short'})).reverse(), datasets: [{ label: '# de Tickets Creados', data: Object.values(last7Days).reverse(), backgroundColor: 'rgba(0, 123, 255, 0.5)', borderColor: 'rgba(0, 123, 255, 1)', borderWidth: 1 }] }, options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } } } }); }

async function renderNewTITicketForm(container) { container.innerHTML = newTITicketFormHTML; const quill = new Quill('#description-editor', { theme: 'snow', placeholder: 'Detalla el problema o solicitud...' }); const dateTimeInput = document.getElementById('ticket-datetime'); const now = new Date(); now.setMinutes(now.getMinutes() - now.getTimezoneOffset()); dateTimeInput.value = now.toISOString().slice(0, 16); const requesterSelect = document.getElementById('requester'); const locationSelect = document.getElementById('location'); const deviceDatalist = document.getElementById('device-list'); const [reqSnap, locSnap, invSnap] = await Promise.all([ db.collection('requesters').get(), db.collection('locations').get(), db.collection('inventory').get() ]); requesterSelect.innerHTML = '<option value="">Selecciona un solicitante</option>'; reqSnap.forEach(doc => requesterSelect.innerHTML += `<option value="${doc.id}">${doc.id}: ${doc.data().name}</option>`); locationSelect.innerHTML = '<option value="">Selecciona una ubicación</option>'; locSnap.forEach(doc => locationSelect.innerHTML += `<option value="${doc.id}">${doc.id}: ${doc.data().name}</option>`); const devices = invSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })); deviceDatalist.innerHTML = devices.map(d => { const userText = d.user ? `(Usuario: ${d.user})` : ''; const serialText = d.serial ? `(Serie: ${d.serial})` : ''; return `<option value="${d.id}">${d.id}: ${d.brand || ''} ${d.model || ''} ${userText} ${serialText}</option>`; }).join(''); const devicesContainer = document.getElementById('associated-devices-container'); devicesContainer.addEventListener('click', e => { if (e.target.classList.contains('add-device-btn')) { const newGroup = document.createElement('div'); newGroup.className = 'device-input-group'; newGroup.innerHTML = `<input type="text" class="device-search" list="device-list" placeholder="Busca por código, usuario, marca..."><button type="button" class="remove-device-btn">-</button>`; devicesContainer.appendChild(newGroup); } if (e.target.classList.contains('remove-device-btn')) { e.target.closest('.device-input-group').remove(); } }); const form = document.getElementById('new-ticket-form'); form.addEventListener('submit', async (e) => { e.preventDefault(); const counterRef = db.collection('counters').doc('ticketCounter'); try { const newTicketId = await db.runTransaction(async (transaction) => { const counterDoc = await transaction.get(counterRef); if (!counterDoc.exists) { throw "El documento contador de tickets no existe. Créalo en Firebase."; } const newNumber = counterDoc.data().currentNumber + 1; transaction.update(counterRef, { currentNumber: newNumber }); return `TICKET-${newNumber}`; }); const deviceInputs = document.querySelectorAll('.device-search'); const deviceIds = Array.from(deviceInputs).map(input => input.value.trim()).filter(value => value !== ''); const ticketDate = new Date(form['ticket-datetime'].value);const ticketTimestamp = firebase.firestore.Timestamp.fromDate(ticketDate);
const ticketNumber = parseInt(newTicketId.split('-')[1], 10);
const newTicketData = {
    numericId: ticketNumber,
    ticketType: 'ti',
    title: form.title.value,
    description: quill.root.innerHTML,
    requesterId: form.requester.value,
    locationId: form.location.value,
    priority: form.priority.value,
    status: 'abierto',
    solution: null,
    deviceIds: deviceIds,
    createdAt: ticketTimestamp,
    closedAt: null,
    history: []
};
await db.collection('tickets').doc(newTicketId).set(newTicketData); alert(`¡Ticket ${newTicketId} creado con éxito!`); window.location.hash = '#tickets'; } catch (error) { console.error("Error al crear el ticket: ", error); alert("No se pudo crear el ticket. Revisa la consola para más detalles."); } }); }

async function renderNewPlatformTicketForm(container, platform) { container.innerHTML = newPlatformTicketFormHTML; document.getElementById('page-title').innerText = `➕ Crear Nuevo Ticket de ${platform}`; const solicitanteSelect = document.getElementById('solicitante'); const medioSolicitudSelect = document.getElementById('medio-solicitud'); try { const reqQuery = await db.collection('requesters').where('name', '==', 'Jahan Michelle Chara').limit(1).get(); if (!reqQuery.empty) { const jahanDoc = reqQuery.docs[0]; solicitanteSelect.innerHTML = `<option value="${jahanDoc.id}">${jahanDoc.data().name}</option>`; solicitanteSelect.disabled = true; } else { solicitanteSelect.innerHTML = `<option value="">Usuario 'Jahan Michelle Chara' no encontrado</option>`; solicitanteSelect.disabled = true; } } catch (error) { console.error("Error al buscar solicitante:", error); solicitanteSelect.innerHTML = `<option value="">Error al cargar solicitante</option>`; solicitanteSelect.disabled = true; } let medioOptions = ''; if (platform === 'Velocity') { medioOptions = `<option value="WhatsApp">WhatsApp</option><option value="Centro de ayuda JIRA">Centro de ayuda JIRA</option>`; } else if (platform === 'Siigo') { medioOptions = `<option value="WhatsApp">WhatsApp</option><option value="Línea de atención Telefónica">Línea de atención Telefónica</option>`; } medioSolicitudSelect.innerHTML = medioOptions; const now = new Date(); document.getElementById('fecha-reporte').value = now.toISOString().split('T')[0]; document.getElementById('hora-reporte').value = now.toTimeString().slice(0, 5); const form = document.getElementById('new-platform-ticket-form'); form.addEventListener('submit', async (e) => { e.preventDefault(); const counterRef = db.collection('counters').doc('ticketCounter'); try { const newTicketId = await db.runTransaction(async (transaction) => { const counterDoc = await transaction.get(counterRef); if (!counterDoc.exists) throw "El contador de tickets no existe."; const newNumber = counterDoc.data().currentNumber + 1; transaction.update(counterRef, { currentNumber: newNumber }); return `TICKET-${newNumber}`; }); const fecha = form['fecha-reporte'].value; const hora = form['hora-reporte'].value; const createdAtTimestamp = firebase.firestore.Timestamp.fromDate(new Date(`${fecha}T${hora}`));
const ticketNumber = parseInt(newTicketId.split('-')[1], 10);
const newTicketData = {
    numericId: ticketNumber,
    ticketType: platform.toLowerCase(),
    fechaDeReporte: fecha,
    horaDeReporte: hora,
    medioDeSolicitud: form['medio-solicitud'].value,
    requesterId: form['solicitante'].value,
    asesorDeSoporte: form['asesor-soporte'].value,
    descripcionDeLaNovedad: form['descripcion-novedad'].value,
    ticketDelCaso: form['ticket-caso'].value,
    status: 'abierto',
    solution: null,
    createdAt: createdAtTimestamp,
    closedAt: null,
    history: []
};
await db.collection('tickets').doc(newTicketId).set(newTicketData); alert(`¡Ticket ${newTicketId} creado con éxito!`); window.location.hash = '#tickets'; } catch (error) { console.error("Error al crear ticket de plataforma: ", error); alert("No se pudo crear el ticket. Revisa la consola."); } }); }

async function renderTicketList(container, params = {}) {
    container.innerHTML = ticketListHTML;
    setupTableSearch('table-search-input', 'data-table');
    const [reqSnap] = await Promise.all([db.collection('requesters').get()]);
    const requestersMap = {};
    reqSnap.forEach(doc => requestersMap[doc.id] = doc.data().name);
    const tableBody = document.querySelector('#data-table tbody');
    const ticketsListTitle = document.getElementById('tickets-list-title');
    let title = 'Todos los Tickets';
    if (params.status === 'abierto') { title = 'Tickets Abiertos'; } else if (params.status === 'cerrado') { title = 'Tickets Cerrados'; }
    ticketsListTitle.innerText = title;
    let query = db.collection('tickets').orderBy('numericId', 'asc');
    if (params.status) { query = query.where('status', '==', params.status); }
    query.onSnapshot(snapshot => {
        tableBody.innerHTML = '';
        if (snapshot.empty) { tableBody.innerHTML = `<tr><td colspan="8">No hay tickets ${params.status ? title.toLowerCase() : ''}.</td></tr>`; return; }
        snapshot.forEach(doc => {
            const ticket = { id: doc.id, ...doc.data() };
            const tr = document.createElement('tr');
            const createdAt = ticket.createdAt ? ticket.createdAt.toDate().toLocaleDateString('es-ES') : 'N/A';
            const closedAt = ticket.closedAt ? ticket.closedAt.toDate().toLocaleDateString('es-ES') : 'N/A';
            const displayTitle = ticket.ticketType === 'ti' ? ticket.title : ticket.descripcionDeLaNovedad;
            const ticketTypeDisplay = ticket.ticketType ? capitalizar(ticket.ticketType) : 'TI';
            tr.innerHTML = `<td>${ticket.id}</td><td><span class="status ${ticketTypeDisplay === 'TI' ? 'status-abierto' : 'status-en-curso'}">${ticketTypeDisplay}</span></td><td>${displayTitle ? (displayTitle.substring(0, 50) + (displayTitle.length > 50 ? '...' : '')) : 'Sin título'}</td><td>${requestersMap[ticket.requesterId] || 'N/A'}</td><td>${createdAt}</td><td>${closedAt}</td><td><span class="status status-${ticket.status}">${capitalizar(ticket.status.replace('-', ' '))}</span></td><td><button class="primary view-ticket-btn" data-id="${ticket.id}">Ver Detalles</button></td>`;
            tableBody.appendChild(tr);
        });
    }, error => handleFirestoreError(error, tableBody));
}
async function renderHistoryPage(container) {
    container.innerHTML = historyPageHTML;
    const form = document.getElementById('history-search-form');
    const deviceDatalist = document.getElementById('device-list-search');
    const requesterSelect = document.getElementById('search-requester');
    const locationSelect = document.getElementById('search-location');
    const resultsTableBody = document.getElementById('data-table').querySelector('tbody');
    const requestersMap = {};
    const locationsMap = {}; 
    try {
        const [reqSnap, locSnap, invSnap] = await Promise.all([db.collection('requesters').orderBy('name').get(), db.collection('locations').orderBy('name').get(), db.collection('inventory').get()]);
        requesterSelect.innerHTML = '<option value="">Todos</option>';
        reqSnap.forEach(doc => { requestersMap[doc.id] = doc.data().name; requesterSelect.innerHTML += `<option value="${doc.id}">${doc.data().name}</option>`; });
        locationSelect.innerHTML = '<option value="">Todas</option>';
        locSnap.forEach(doc => { locationsMap[doc.id] = doc.data().name; locationSelect.innerHTML += `<option value="${doc.id}">${doc.data().name}</option>`; });
        const devices = invSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        deviceDatalist.innerHTML = devices.map(d => `<option value="${d.id}">${d.id}: ${d.brand || ''} ${d.model || ''} (Usuario: ${d.user || 'N/A'})</option>`).join('');
    } catch (error) { handleFirestoreError(error, container); return; }
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        resultsTableBody.innerHTML = `<tr><td colspan="9">Buscando...</td></tr>`; 
        let query = db.collection('tickets');
        const filters = {
            deviceIds: form['search-device'].value,
            requesterId: form['search-requester'].value,
            locationId: form['search-location'].value,
            status: form['search-status'].value,
            priority: form['search-priority'].value,
            ticketType: form['search-ticket-type'].value
        };
        for (const [key, value] of Object.entries(filters)) {
            if (value) {
                if (key === 'deviceIds') {
                    query = query.where(key, 'array-contains', value);
                } else {
                    query = query.where(key, '==', value);
                }
            }
        }
        const startDateValue = form['search-start-date'].value;
        const endDateValue = form['search-end-date'].value;
        if (startDateValue) {
            const startDate = new Date(startDateValue);
            startDate.setHours(0, 0, 0, 0); 
            query = query.where('createdAt', '>=', startDate);
        }
        if (endDateValue) {
            const endDate = new Date(endDateValue);
            endDate.setHours(23, 59, 59, 999); 
            query = query.where('createdAt', '<=', endDate);
        }
        query = query.orderBy('createdAt', 'desc');
        try {
            const snapshot = await query.get();
            const tickets = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            resultsTableBody.innerHTML = '';
            if (tickets.length === 0) { resultsTableBody.innerHTML = `<tr><td colspan="9">No se encontraron tickets con esos criterios.</td></tr>`; return; }
            tickets.forEach(ticket => {
                const tr = document.createElement('tr');
                const closedAtText = ticket.closedAt && ticket.closedAt.toDate ? ticket.closedAt.toDate().toLocaleString('es-ES') : 'N/A';
                const requesterDisplayName = requestersMap[ticket.requesterId] || 'N/A';
                const displayTitle = ticket.ticketType === 'ti' ? ticket.title : ticket.descripcionDeLaNovedad;
                const ticketTypeDisplay = ticket.ticketType ? capitalizar(ticket.ticketType) : 'TI';
                tr.innerHTML = `<td>${ticket.id}</td><td>${displayTitle ? (displayTitle.substring(0, 50) + (displayTitle.length > 50 ? '...' : '')) : 'Sin título'}</td><td><span class="status ${ticketTypeDisplay === 'TI' ? 'status-abierto' : 'status-en-curso'}">${ticketTypeDisplay}</span></td><td>${ticket.ticketDelCaso || 'N/A'}</td><td>${requesterDisplayName}</td><td>${ticket.createdAt.toDate().toLocaleString('es-ES')}</td><td>${closedAtText}</td><td><span class="status status-${ticket.status}">${capitalizar(ticket.status.replace('-', ' '))}</span></td><td><a href="#" class="view-ticket-btn" data-id="${ticket.id}">Ver Detalles</a></td>`;
                resultsTableBody.appendChild(tr);
            });
        } catch (error) { handleFirestoreError(error, resultsTableBody); }
    });
    form.dispatchEvent(new Event('submit'));
}
async function renderEstadisticas(container) { container.innerHTML = statisticsHTML; const generateBtn = document.getElementById('generate-report-btn'); document.getElementById('export-stats-pdf').addEventListener('click', exportStatsToPDF); let charts = {}; const chartContexts = { ticketsByPriority: document.getElementById('ticketsByPriorityChart').getContext('2d'), ticketsByDeviceCategory: document.getElementById('ticketsByDeviceCategoryChart').getContext('2d'), ticketFlow: document.getElementById('ticket-flow-chart').getContext('2d'), inventoryByCategory: document.getElementById('inventoryByCategoryChart').getContext('2d'), computersByOs: document.getElementById('computersByOsChart').getContext('2d') }; const topDevicesList = document.getElementById('top-devices-list'); const topRequestersList = document.getElementById('top-requesters-list'); const startDateInput = document.getElementById('start-date'); const endDateInput = document.getElementById('end-date'); const today = new Date(); const oneMonthAgo = new Date(new Date().setMonth(today.getMonth() - 1)); startDateInput.value = oneMonthAgo.toISOString().split('T')[0]; endDateInput.value = today.toISOString().split('T')[0]; const generateReports = async () => { const startDate = new Date(startDateInput.value); startDate.setHours(0, 0, 0, 0); const endDate = new Date(endDateInput.value); endDate.setHours(23, 59, 59, 999); try { const [ticketsSnapshot, inventorySnapshot, requestersSnapshot] = await Promise.all([ db.collection('tickets').where('createdAt', '>=', startDate).where('createdAt', '<=', endDate).get(), db.collection('inventory').get(), db.collection('requesters').get() ]); const tickets = ticketsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })); const inventory = inventorySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })); const requestersMap = {}; requestersSnapshot.forEach(doc => requestersMap[doc.id] = doc.data().name); const priorityCounts = tickets.reduce((acc, ticket) => { acc[ticket.priority] = (acc[ticket.priority] || 0) + 1; return acc; }, {}); if (charts.ticketsByPriority) charts.ticketsByPriority.destroy(); charts.ticketsByPriority = new Chart(chartContexts.ticketsByPriority, { type: 'doughnut', data: { labels: Object.keys(priorityCounts).map(p => capitalizar(p)), datasets: [{ data: Object.values(priorityCounts), backgroundColor: ['#007bff', '#ffc107', '#dc3545'] }] }, options: { responsive: true, maintainAspectRatio: false } }); const inventoryMap = {}; inventory.forEach(item => inventoryMap[item.id] = item); const ticketsWithDeviceCategory = tickets.map(ticket => ({...ticket, deviceCategory: ticket.deviceIds && ticket.deviceIds.length > 0 ? (inventoryMap[ticket.deviceIds[0]]?.category || 'Sin categoría') : 'Sin dispositivo'})); const deviceCategoryCounts = ticketsWithDeviceCategory.reduce((acc, ticket) => { acc[ticket.deviceCategory] = (acc[ticket.deviceCategory] || 0) + 1; return acc; }, {}); if (charts.ticketsByDeviceCategory) charts.ticketsByDeviceCategory.destroy(); charts.ticketsByDeviceCategory = new Chart(chartContexts.ticketsByDeviceCategory, { type: 'pie', data: { labels: Object.keys(deviceCategoryCounts).map(k => inventoryCategoryConfig[k]?.title || k), datasets: [{ data: Object.values(deviceCategoryCounts), backgroundColor: ['#007bff', '#17a2b8', '#ffc107', '#6c757d', '#28a745', '#dc3545', '#343a40'] }] }, options: { responsive: true, maintainAspectRatio: false } }); const deviceTicketCounts = tickets.reduce((acc, ticket) => { if(ticket.deviceIds && Array.isArray(ticket.deviceIds)) { ticket.deviceIds.forEach(deviceId => { if(deviceId) acc[deviceId] = (acc[deviceId] || 0) + 1; }); } return acc; }, {}); const topDevices = Object.entries(deviceTicketCounts).sort((a, b) => b[1] - a[1]).slice(0, 5); topDevicesList.innerHTML = topDevices.map(([id, count]) => { const device = inventoryMap[id]; return `<li><span>${device ? `${device.brand} ${device.model}` : id}</span><span>${count}</span></li>`; }).join('') || '<li>No hay datos</li>'; const requesterTicketCounts = tickets.reduce((acc, ticket) => { if(ticket.requesterId) acc[ticket.requesterId] = (acc[ticket.requesterId] || 0) + 1; return acc; }, {}); const topRequesters = Object.entries(requesterTicketCounts).sort((a, b) => b[1] - a[1]).slice(0, 5); topRequestersList.innerHTML = topRequesters.map(([id, count]) => `<li><span>${requestersMap[id] || id}</span><span>${count}</span></li>`).join('') || '<li>No hay datos</li>'; const closedTicketsSnapshot = await db.collection('tickets').where('closedAt', '>=', startDate).where('closedAt', '<=', endDate).get(); const closedTicketsInRange = closedTicketsSnapshot.docs.map(doc => doc.data()); const dataByDay = {}; for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) { dataByDay[d.toISOString().split('T')[0]] = { created: 0, closed: 0 }; } tickets.forEach(t => { const day = t.createdAt.toDate().toISOString().split('T')[0]; if (dataByDay[day]) dataByDay[day].created++; }); closedTicketsInRange.forEach(t => { const day = t.closedAt.toDate().toISOString().split('T')[0]; if (dataByDay[day]) dataByDay[day].closed++; }); if (charts.ticketFlow) charts.ticketFlow.destroy(); charts.ticketFlow = new Chart(chartContexts.ticketFlow, { type: 'line', data: { labels: Object.keys(dataByDay), datasets: [ { label: 'Tickets Creados', data: Object.values(dataByDay).map(d => d.created), borderColor: '#007bff', fill: true }, { label: 'Tickets Cerrados', data: Object.values(dataByDay).map(d => d.closed), borderColor: '#28a745', fill: true } ] }, options: { scales: { y: { beginAtZero: true } } } }); const categoryCounts = inventory.reduce((acc, item) => { acc[item.category] = (acc[item.category] || 0) + 1; return acc; }, {}); if (charts.inventoryByCategory) charts.inventoryByCategory.destroy(); charts.inventoryByCategory = new Chart(chartContexts.inventoryByCategory, { type: 'bar', data: { labels: Object.keys(categoryCounts).map(k => inventoryCategoryConfig[k]?.title || k), datasets: [{ label: '# de Dispositivos', data: Object.values(categoryCounts), backgroundColor: '#007bff' }] }, options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false } }); const computers = inventory.filter(item => item.category === 'computers'); const osCounts = computers.reduce((acc, item) => { acc[item.os] = (acc[item.os] || 0) + 1; return acc; }, {}); if (charts.computersByOs) charts.computersByOs.destroy(); charts.computersByOs = new Chart(chartContexts.computersByOs, { type: 'pie', data: { labels: Object.keys(osCounts), datasets: [{ data: Object.values(osCounts), backgroundColor: ['#007bff', '#17a2b8', '#ffc107', '#6c757d', '#28a745', '#dc3545'] }] }, options: { responsive: true, maintainAspectRatio: false } }); } catch(error) { handleFirestoreError(error, container); }}; generateBtn.addEventListener('click', generateReports); generateReports(); }
function renderGenericListPage(container, params, configObject, collectionName, icon) { container.innerHTML = genericListPageHTML; setupTableSearch('table-search-input', 'data-table'); const category = params.category; const config = configObject[category]; if (!config) { container.innerHTML = `<h1>Error: Categoría no encontrada.</h1>`; return; } const iconEdit = `<svg class="icon-edit" viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>`; const iconDelete = `<svg class="icon-delete" viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>`; const iconHistory = `<svg class="icon-history" viewBox="0 0 24 24"><path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.25 2.52.77-1.28-3.52-2.09V8H12z"/></svg>`; document.getElementById('page-title').innerText = `${icon} ${config.title}`; document.getElementById('item-list-title').innerText = `Lista de ${config.title}`; const addButton = document.getElementById('add-item-btn'); addButton.innerText = `Añadir ${config.titleSingular}`; addButton.dataset.type = collectionName; addButton.dataset.category = category; const tableHeadContainer = document.getElementById('item-table-head'); const tableHeaders = Object.values(config.fields).map(field => field.label); tableHeadContainer.innerHTML = `<tr>${tableHeaders.map(h => `<th>${h}</th>`).join('')}<th>Acciones</th></tr>`; const tableBody = document.getElementById('item-table-body'); db.collection(collectionName).where('category', '==', category).orderBy("numericId", "asc").onSnapshot(snapshot => { tableBody.innerHTML = ''; if (snapshot.empty) { tableBody.innerHTML = `<tr><td colspan="${tableHeaders.length + 1}">No hay elementos.</td></tr>`; return; } snapshot.forEach(doc => { const item = { id: doc.id, ...doc.data() }; const tr = document.createElement('tr'); tr.dataset.id = item.id; let cellsHTML = ''; for (const key of Object.keys(config.fields)) { let cellContent = key === 'id' ? item.id : (item[key] || 'N/A'); if (key === 'os' && cellContent !== 'N/A' && collectionName === 'inventory') { cellContent = `<a href="#credentials-software" style="color: blue; text-decoration: underline;">${cellContent}</a>`; } if (key === 'status') { const statusClass = (cellContent || '').toLowerCase().replace(/ /g, '-'); cellsHTML += `<td data-field="${key}"><span class="status status-${statusClass}">${capitalizar(cellContent)}</span></td>`; } else { cellsHTML += `<td data-field="${key}"><span class="cell-text">${cellContent}</span></td>`; } } let actionsHTML = `<span class="edit-btn" data-id="${item.id}" data-collection="${collectionName}" data-category="${category}">${iconEdit}</span>`; if (collectionName === 'inventory') { actionsHTML += `<span class="history-btn" data-id="${item.id}">${iconHistory}</span>`; } actionsHTML += `<span class="delete-btn" data-id="${item.id}" data-collection="${collectionName}">${iconDelete}</span>`; tr.innerHTML = `${cellsHTML}<td><div class="config-item-actions">${actionsHTML}</div></td>`; tableBody.appendChild(tr); }); }, error => handleFirestoreError(error, tableBody)); }
async function showDeviceHistoryModal(deviceId) { const historyModal = document.getElementById('history-modal'); const modalBody = historyModal.querySelector('#history-modal-body'); modalBody.innerHTML = `<h2>Historial de Tickets para ${deviceId}</h2><p>Cargando historial...</p>`; historyModal.classList.remove('hidden'); try { const snapshot = await db.collection('tickets').where('deviceIds', 'array-contains', deviceId).orderBy('createdAt', 'desc').get(); if (snapshot.empty) { modalBody.innerHTML = `<h2>Historial de Tickets para ${deviceId}</h2><p>No hay tickets asociados a este dispositivo.</p>`; return; } let historyHTML = `<h2>Historial de Tickets para ${deviceId}</h2><ul class="simple-list" style="list-style-type: none; padding-left: 0;">`; snapshot.forEach(doc => { const ticket = doc.data(); const ticketDate = ticket.createdAt ? ticket.createdAt.toDate().toLocaleDateString('es-ES') : 'Fecha N/A'; historyHTML += `<li style="display:flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee;"><span><a href="#" class="view-ticket-btn" data-id="${doc.id}" style="color:blue; text-decoration:underline;">#${doc.id}</a>: ${ticket.title} (${ticketDate})</span><span class="status status-${ticket.status}">${capitalizar(ticket.status)}</span></li>`; }); historyHTML += '</ul>'; modalBody.innerHTML = historyHTML; } catch (error) { console.error("Error al cargar historial de tickets:", error); modalBody.innerHTML = `<h2>Historial de Tickets para ${deviceId}</h2><p style="color:red;">Error al cargar el historial. Asegúrate de que el índice de Firestore se haya creado correctamente.</p>`; handleFirestoreError(error, modalBody); } }
function renderMaintenanceCalendar(container) { container.innerHTML = maintenanceCalendarHTML; const calendarEl = document.getElementById('maintenance-calendar'); const dataTable = document.getElementById('data-table'); db.collection('maintenance').where('status', 'in', ['planificada', 'completada']).onSnapshot(snapshot => { const eventColors = { 'Mantenimiento Preventivo': '#dc3545', 'Mantenimiento Correctivo': '#ffc107', 'Mantenimiento Lógico': '#6f42c1', 'Backup': '#fd7e14', 'Tarea': '#007bff', 'Recordatorio': '#17a2b8' }; const events = snapshot.docs.map(doc => { const data = doc.data(); let color = eventColors[data.type] || '#6c757d'; if (data.status === 'completada') color = '#28a745'; return { id: doc.id, title: data.task, start: data.date, color: color, extendedProps: { status: data.status, ...data } }; }); const calendar = new FullCalendar.Calendar(calendarEl, { headerToolbar: { left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek' }, initialView: 'dayGridMonth', locale: 'es', buttonText: { today: 'hoy', month: 'mes', week: 'semana', day: 'día', list: 'agenda' }, events: events, eventClick: function(info) { showEventActionChoiceModal(info.event.id, info.event.title, info.event.extendedProps); } }); calendar.render(); const tableHeaders = ['Tarea', 'Fecha Programada', 'Tipo', 'Estado']; const tableRows = snapshot.docs.map(doc => { const data = doc.data(); return [data.task, data.date, data.type, data.status]; }); dataTable.innerHTML = `<thead><tr>${tableHeaders.map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody>${tableRows.map(row => `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`).join('')}</tbody>`; }, error => handleFirestoreError(error, calendarEl)); }
function renderConfiguracion(container) { container.innerHTML = configHTML; const setupConfigSection = (type, collectionName, prefix, counterName) => { const form = document.getElementById(`add-${type}-form`); const input = document.getElementById(`${type}-name`); const list = document.getElementById(`${type}s-list`); const iconEdit = `<svg class="icon-edit" viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>`; const iconDelete = `<svg class="icon-delete" viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>`; form.addEventListener('submit', async (e) => { e.preventDefault(); const name = input.value.trim(); if (!name) return; const counterRef = db.collection('counters').doc(counterName); try { let newId; let newNumber; await db.runTransaction(async (transaction) => { const counterDoc = await transaction.get(counterRef); if (!counterDoc.exists) { throw `El contador '${counterName}' no existe en Firebase.`; } newNumber = counterDoc.data().currentNumber + 1; transaction.update(counterRef, { currentNumber: newNumber }); newId = `${prefix}${newNumber}`; }); await db.collection(collectionName).doc(newId).set({ name: name, numericId: newNumber }); form.reset(); } catch (error) { console.error("Error al crear item:", error); alert("No se pudo crear el nuevo ítem. Revisa la consola."); } }); db.collection(collectionName).orderBy("numericId", "asc").onSnapshot(snapshot => { list.innerHTML = ''; snapshot.forEach(doc => { const item = { id: doc.id, ...doc.data() }; const li = document.createElement('li'); li.className = 'config-list-item'; li.innerHTML = `<div><strong style="margin-right: 10px;">${item.id}</strong><span class="config-item-name">${item.name}</span></div><div class="config-item-actions"><span class="edit-btn" data-collection="${collectionName}" data-id="${item.id}" data-type="config">${iconEdit}</span><span class="delete-btn" data-id="${item.id}" data-collection="${collectionName}">${iconDelete}</span></div>`; list.appendChild(li); }); }, error => handleFirestoreError(error, list)); }; setupConfigSection('requester', 'requesters', 'REQ-', 'requesterCounter'); setupConfigSection('location', 'locations', 'LOC-', 'locationCounter'); setupConfigSection('atencion', 'credentials', 'CRED-APPAT-', 'atencionCounter'); }
async function showItemFormModal(type, category = null, docId = null) {
    const formModal = document.getElementById('form-modal');
    const modalBody = formModal.querySelector('#form-modal-body');
    
    try {
        const isEditing = docId !== null;
        let formHTML = '', title = '', collectionName = '', formId = 'modal-form', config;
        let existingData = {};

        if (isEditing) {
            const collectionForSearch = (type === 'config') ? category : type;
            const docSnap = await db.collection(collectionForSearch).doc(docId).get();
            if (docSnap.exists) { existingData = docSnap.data(); } 
            else { alert("Error: No se encontró el elemento a editar."); return; }
        }
    
        let softwareLicenseDetails = null; 

        const shouldFetchLicenseDetails = isEditing &&
                                         type === 'inventory' &&
                                         category === 'computers' &&
                                         existingData.os;

        if (shouldFetchLicenseDetails) {
            const licenseDocSnap = await db.collection('credentials').doc(existingData.os).get();
            if (licenseDocSnap.exists) {
                softwareLicenseDetails = licenseDocSnap.data();
            }
        }

        const configObject = (type === 'inventory') ? inventoryCategoryConfig : 
                             (type === 'credentials') ? credentialsCategoryConfig :
                             (type === 'services') ? servicesCategoryConfig : {};
        config = configObject[category];

        if (!config) {
            if (type === 'maintenance') {
                title = isEditing ? 'Editar Tarea' : 'Programar Tarea';
                collectionName = 'maintenance';
                const task = existingData.task || '';
                const date = existingData.date || '';
                const taskType = existingData.type || 'Tarea';
                formHTML = `<div class="form-group"><label for="form-task">Título de la Tarea</label><input type="text" id="form-task" name="task" value="${task}" required></div><div class="form-group"><label for="form-date">Fecha</label><input type="date" id="form-date" name="date" value="${date}" required></div><div class="form-group"><label for="form-type">Tipo de Tarea</label><select id="form-type" name="type"><option value="Mantenimiento Preventivo" ${taskType === 'Mantenimiento Preventivo' ? 'selected' : ''}>Mantenimiento Preventivo</option><option value="Mantenimiento Correctivo" ${taskType === 'Mantenimiento Correctivo' ? 'selected' : ''}>Mantenimiento Correctivo</option><option value="Mantenimiento Lógico" ${taskType === 'Mantenimiento Lógico' ? 'selected' : ''}>Mantenimiento Lógico</option><option value="Backup" ${taskType === 'Backup' ? 'selected' : ''}>Backup</option><option value="Tarea" ${taskType === 'Tarea' ? 'selected' : ''}>Tarea</option><option value="Recordatorio" ${taskType === 'Recordatorio' ? 'selected' : ''}>Recordatorio</option></select></div>`;
            } else if (type === 'config') {
                collectionName = category;
                title = isEditing ? `Editar ${collectionName === 'requesters' ? 'Solicitante' : 'Ubicación'}` : `Añadir ${collectionName === 'requesters' ? 'Solicitante' : 'Ubicación'}`;
                const name = existingData.name || '';
                formHTML = `<div class="form-group"><label for="form-name">Nombre</label><input type="text" id="form-name" name="name" value="${name}" required></div>`;
            }
        } else {
            title = isEditing ? `Editar ${config.titleSingular}` : `Añadir ${config.titleSingular}`;
            collectionName = type;
            let fieldsHTML = '';
            for (const [key, field] of Object.entries(config.fields)) {
                if (key === 'id') continue;
                
                const value = existingData[key] || '';
                const isRequired = field.required ? 'required' : '';
                let inputHTML = '';

                if (field.readonly) {
                    let displayValue = value || 'N/A';
                    if (key === 'os' && softwareLicenseDetails) {
                        displayValue = `${softwareLicenseDetails.softwareName} (${softwareLicenseDetails.version || 'sin versión'})`;
                    }
                    fieldsHTML += `<div class="form-group"><label for="form-${key}">${field.label}</label><input type="text" id="form-${key}" name="${key}" value="${displayValue}" readonly style="background:#eee;"></div>`;
                    continue;
                }
                
                if (field.type === 'text' && field.optionsSource === 'computers-inventory') {
                    const datalistId = `datalist-for-${key}`;
                    const placeholder = field.placeholder || '';
                    let displayValue = value; 

                    const allComputersSnap = await db.collection('inventory').where('category', '==', 'computers').get();
                    const computerOptions = allComputersSnap.docs.map(doc => {
                        const d = doc.data();
                        return {
                            id: doc.id,
                            fullText: `${doc.id}: ${d.brand || ''} ${d.model || ''} (${d.user || 'Sin Usuario'})`
                        };
                    });
                    const optionsHTML = computerOptions.map(opt => `<option value="${opt.fullText}"></option>`).join('');

                    if (isEditing && displayValue) {
                        const matchingOption = computerOptions.find(opt => opt.id === displayValue);
                        if (matchingOption) {
                            displayValue = matchingOption.fullText;
                        }
                    }
                    
                    inputHTML = `<input type="text" id="form-${key}" name="${key}" value="${displayValue}" list="${datalistId}" placeholder="${placeholder}" ${isRequired} autocomplete="off">
                                 <datalist id="${datalistId}">${optionsHTML}</datalist>`;
                } else if (field.type === 'select') {
                    let optionsHTML = '';
                    if (field.optionsSource === 'locations') {
                        const locSnap = await db.collection('locations').get();
                        optionsHTML += locSnap.docs.map(doc => `<option value="${doc.id}" ${doc.id === value ? 'selected' : ''}>${doc.id}: ${doc.data().name}</option>`).join('');
                    } 
                    else if (field.optionsSource === 'computers-inventory') {
                        const computersMap = new Map();
                        const allComputersSnap = await db.collection('inventory').where('category', '==', 'computers').get();
                        allComputersSnap.forEach(doc => {
                            const computerData = doc.data();
                            if (!computerData.os) { computersMap.set(doc.id, `${doc.id}: ${computerData.brand} ${computerData.model}`); }
                        });
                        if (isEditing && value && !computersMap.has(value)) {
                            const currentCompSnap = await db.collection('inventory').doc(value).get();
                            if (currentCompSnap.exists) {
                                const d = currentCompSnap.data();
                                computersMap.set(currentCompSnap.id, `${d.id}: ${d.brand} ${d.model} (Asignado actualmente)`);
                            }
                        }
                        for (const [id, name] of computersMap.entries()) {
                            optionsHTML += `<option value="${id}" ${id === value ? 'selected' : ''}>${name}</option>`;
                        }
                    }
                    else if (field.optionsSource === 'software-licenses') {
                        const licensesMap = new Map();
                        const allLicensesSnap = await db.collection('credentials').where('category', '==', 'software').get();
                        
                        allLicensesSnap.forEach(doc => {
                            const licenseData = doc.data();
                            if (!licenseData.assignedTo) { licensesMap.set(doc.id, `${doc.id}: ${licenseData.softwareName} v${licenseData.version || '?'}`); }
                        });

                        if (isEditing && value && !licensesMap.has(value)) {
                            const currentLicenseSnap = await db.collection('credentials').doc(value).get();
                            if (currentLicenseSnap.exists) {
                                const d = currentLicenseSnap.data();
                                licensesMap.set(currentLicenseSnap.id, `${d.id}: ${d.softwareName} v${d.version || '?'} (Asignada actualmente)`);
                            }
                        }

                        for (const [id, name] of licensesMap.entries()) {
                            optionsHTML += `<option value="${id}" ${id === value ? 'selected' : ''}>${name}</option>`;
                        }
                    }
                    else {
                        optionsHTML += field.options.map(opt => `<option value="${opt}" ${opt === value ? 'selected' : ''}>${opt}</option>`).join('');
                    }
                    inputHTML = `<select id="form-${key}" name="${key}" ${isRequired}><option value="">(No asignar / Ninguna)</option>${optionsHTML}</select>`;
                } else if (field.type === 'textarea') {
                    inputHTML = `<textarea id="form-${key}" name="${key}" rows="3" ${isRequired}>${value}</textarea>`;
                } else {
                    inputHTML = `<input type="${field.type || 'text'}" id="form-${key}" name="${key}" value="${value}" ${isRequired}>`;
                }
                fieldsHTML += `<div class="form-group"><label for="form-${key}">${field.label}</label>${inputHTML}</div>`;
            }
            formHTML = `<div class="inventory-form-grid">${fieldsHTML}</div>`;
            if (isEditing && type === 'inventory') {
                formHTML += `<hr style="margin-top: 25px; margin-bottom: 15px;"><h3>Historial de Tickets Asociados</h3><div id="device-ticket-history" style="max-height: 200px; overflow-y: auto;">Cargando historial...</div>`;
            }
        }
        modalBody.innerHTML = `<h2>${title}</h2><form id="${formId}">${formHTML}<div style="text-align:right; margin-top:20px;"><button type="submit" class="primary">${isEditing ? 'Guardar Cambios' : 'Guardar'}</button></div></form>`;
        formModal.classList.remove('hidden');

        if (isEditing && type === 'inventory') {
            setTimeout(() => {
                const historyContainer = document.getElementById('device-ticket-history');
                if (historyContainer) {
                    db.collection('tickets').where('deviceIds', '==', docId).orderBy('createdAt', 'desc').get()
                        .then(snapshot => {
                            if (snapshot.empty) { historyContainer.innerHTML = '<p>No hay tickets asociados a este dispositivo.</p>'; return; }
                            let historyHTML = '<ul class="simple-list" style="list-style-type: none; padding-left: 0;">';
                            snapshot.forEach(doc => {
                                const ticket = doc.data();
                                const ticketDate = ticket.createdAt ? ticket.createdAt.toDate().toLocaleDateString('es-ES') : 'Fecha N/A';
                                historyHTML += `<li style="display:flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee;"><span><a href="#" class="view-ticket-btn" data-id="${doc.id}" style="color:blue; text-decoration:underline;">#${doc.id}</a>: ${ticket.title} (${ticketDate})</span><span class="status status-${ticket.status}">${ticket.status}</span></li>`;
                            });
                            historyHTML += '</ul>';
                            historyContainer.innerHTML = historyHTML;
                        });
                }
            }, 100);
        }

        document.getElementById(formId).addEventListener('submit', async (e) => {
            e.preventDefault();
            const form = e.target;
            const data = {};
            const formData = new FormData(form);
            formData.forEach((value, key) => {
                const fieldConfig = config.fields[key];
                if (fieldConfig && fieldConfig.type === 'text' && fieldConfig.optionsSource === 'computers-inventory') {
                    if (value && value.includes(':')) {
                        data[key] = value.split(':')[0].trim();
                    } else {
                        data[key] = value;
                    }
                } else {
                    data[key] = value;
                }
            });
    
            try {
                if (isEditing) {
                    if (type === 'credentials' && category === 'software') {
                        const newComputerId = data.assignedTo || null;
                        const oldComputerId = existingData.assignedTo || null;
                        
                        if (newComputerId !== oldComputerId) {
                            await db.runTransaction(async (transaction) => {
                                const licenseRef = db.collection('credentials').doc(docId);
                                transaction.update(licenseRef, data);
                                if (oldComputerId) {
                                    const oldCompRef = db.collection('inventory').doc(oldComputerId);
                                    transaction.update(oldCompRef, { os: null });
                                }
                                if (newComputerId) {
                                    const newCompRef = db.collection('inventory').doc(newComputerId);
                                    transaction.update(newCompRef, { os: docId });
                                }
                            });
                        } else {
                            await db.collection(collectionName).doc(docId).update(data);
                        }
                    } else if (type === 'inventory' && category === 'computers') {
                        const newLicenseId = data.os || null;
                        const oldLicenseId = existingData.os || null;
    
                        if (newLicenseId !== oldLicenseId) {
                             await db.runTransaction(async (transaction) => {
                                const computerRef = db.collection('inventory').doc(docId);
                                transaction.update(computerRef, data);
                                if (oldLicenseId) {
                                    const oldLicenseRef = db.collection('credentials').doc(oldLicenseId);
                                    transaction.update(oldLicenseRef, { assignedTo: null });
                                }
                                if (newLicenseId) {
                                    const newLicenseRef = db.collection('credentials').doc(newLicenseId);
                                    transaction.update(newLicenseRef, { assignedTo: docId });
                                }
                            });
                        } else {
                            await db.collection(collectionName).doc(docId).update(data);
                        }
                    } else {
                        await db.collection(collectionName).doc(docId).update(data);
                    }
                } else {
                    if (type === 'inventory' || type === 'credentials' || type === 'services') {
                        data.category = category;
                        const { prefix, counter } = config;
                        if (!prefix || !counter) { alert('Error de configuración.'); return; }
                        const counterRef = db.collection('counters').doc(counter);
                        let newId, newNumber;
                        await db.runTransaction(async (transaction) => {
                            const counterDoc = await transaction.get(counterRef);
                            if (!counterDoc.exists) throw `El contador '${counter}' no existe.`;
                            newNumber = counterDoc.data().currentNumber + 1;
                            transaction.update(counterRef, { currentNumber: newNumber });
                            newId = `${prefix}${newNumber}`;
                        });
                        data.numericId = newNumber;
                        await db.collection(collectionName).doc(newId).set(data);
                        
                        if (type === 'credentials' && category === 'software' && data.assignedTo) {
                            await db.collection('inventory').doc(data.assignedTo).update({ os: newId });
                        }
                        if (type === 'inventory' && category === 'computers' && data.os) {
                            await db.collection('credentials').doc(data.os).update({ assignedTo: newId });
                        }
                    } else {
                        if (type === 'maintenance') data.status = 'planificada';
                        await db.collection(collectionName).add(data);
                    }
                }
                formModal.classList.add('hidden');
            } catch (error) {
                console.error("Error al guardar:", error);
                alert("Hubo un error al guardar. Revisa la consola.");
            }
        });

    } catch (error) {
        console.error("Error al mostrar el formulario modal:", error);
        alert(`No se pudo abrir el formulario.\n\nError: ${error.message}\n\nEsto puede deberse a un índice de Firestore faltante. Revisa la consola (F12) para más detalles.`);
    }
}
function showEventActionChoiceModal(eventId, eventTitle, eventProps) { const actionModal = document.getElementById('action-modal'); const modalBody = actionModal.querySelector('#action-modal-body'); let completedInfo = ''; if (eventProps.status === 'completada') { completedInfo = `<hr><h4>Información de Finalización</h4><p><strong>Fecha:</strong> ${new Date(eventProps.completedDate + 'T00:00:00').toLocaleDateString('es-ES')}</p><p><strong>A tiempo:</strong> ${eventProps.onTimeStatus}</p><p><strong>Observaciones:</strong> ${eventProps.completionNotes || 'N/A'}</p>`; } const actionButtons = eventProps.status === 'planificada' ? `<div style="display: flex; justify-content: space-around; flex-wrap: wrap; gap: 10px; margin-top: 20px;"><button class="primary" id="edit-task-btn" style="background-color: #ffc107; color: #212529;">✏️ Editar Tarea</button><button class="primary" id="finalize-task-btn">✅ Finalizar Tarea</button><button class="danger" id="delete-task-btn">🗑️ Eliminar</button></div>` : ''; modalBody.innerHTML = `<h2>${eventTitle}</h2><p><strong>Estado:</strong> ${eventProps.status}</p>${completedInfo}${actionButtons}`; actionModal.classList.remove('hidden'); if (eventProps.status === 'planificada') { document.getElementById('edit-task-btn').onclick = () => { actionModal.classList.add('hidden'); showItemFormModal('maintenance', null, eventId); }; document.getElementById('finalize-task-btn').onclick = () => { actionModal.classList.add('hidden'); showFinalizeTaskModal(eventId, eventTitle); }; document.getElementById('delete-task-btn').onclick = () => { if (confirm(`¿Estás seguro de que quieres ELIMINAR permanentemente la tarea "${eventTitle}"? Esta acción no se puede deshacer.`)) { db.collection('maintenance').doc(eventId).delete().then(() => { actionModal.classList.add('hidden'); }).catch(error => { console.error("Error al eliminar la tarea: ", error); alert("No se pudo eliminar la tarea."); }); } }; } }
function showFinalizeTaskModal(eventId, eventTitle) { const actionModal = document.getElementById('action-modal'); const modalBody = actionModal.querySelector('#action-modal-body'); const today = new Date().toISOString().split('T')[0]; modalBody.innerHTML = `<h2>Finalizar Tarea: "${eventTitle}"</h2><form id="finalize-form"><div class="form-group"><label for="completedDate">Fecha de Realización</label><input type="date" id="completedDate" name="completedDate" value="${today}" required></div><div class="form-group"><label for="onTimeStatus">¿Se realizó a tiempo?</label><select id="onTimeStatus" name="onTimeStatus"><option value="Sí">Sí</option><option value="No">No</option></select></div><div class="form-group"><label>Observaciones (opcional)</label><textarea name="completionNotes" rows="3"></textarea></div><div style="text-align: right; margin-top: 20px;"><button type="submit" class="primary">Guardar Finalización</button></div></form>`; actionModal.classList.remove('hidden'); document.getElementById('finalize-form').addEventListener('submit', async (e) => { e.preventDefault(); const form = e.target; form.querySelector('button[type="submit"]').disabled = true; try { const updateData = { status: 'completada', completedDate: form.completedDate.value, onTimeStatus: form.onTimeStatus.value, completionNotes: form.completionNotes.value }; await db.collection('maintenance').doc(eventId).set(updateData, { merge: true }); actionModal.classList.add('hidden'); } catch (error) { console.error("Error al finalizar la tarea: ", error); alert("Hubo un error al finalizar la tarea. Revisa la consola para más detalles."); form.querySelector('button[type="submit"]').disabled = false; } }); }
function showCancelTaskModal(eventId, eventTitle) { const actionModal = document.getElementById('action-modal'); const modalBody = actionModal.querySelector('#action-modal-body'); modalBody.innerHTML = `<h2>Cancelar Tarea: "${eventTitle}"</h2><form id="cancel-form"><div class="form-group"><label for="cancellationReason">Razón de la Cancelación</label><textarea id="cancellationReason" name="cancellationReason" rows="4" required></textarea></div><div style="text-align: right; margin-top: 20px;"><button type="submit" class="danger">Confirmar Cancelación</button></div></form>`; actionModal.classList.remove('hidden'); document.getElementById('cancel-form').addEventListener('submit', e => { e.preventDefault(); const reason = e.target.cancellationReason.value; db.collection('maintenance').doc(eventId).update({ status: 'cancelada', cancellationReason: reason }).then(() => actionModal.classList.add('hidden')); }); }
async function showEditTicketModal(ticketId) { const formModal = document.getElementById('form-modal'); const modalBody = formModal.querySelector('#form-modal-body'); const ticketDoc = await db.collection('tickets').doc(ticketId).get(); if (!ticketDoc.exists) { alert("Error: Ticket no encontrado."); return; } const ticket = ticketDoc.data(); if(ticket.ticketType !== 'ti') { alert('La edición solo está disponible para tickets de tipo TI en este momento.'); return; } const [reqSnap, locSnap, invSnap] = await Promise.all([ db.collection('requesters').get(), db.collection('locations').get(), db.collection('inventory').get() ]); const requestersOptions = reqSnap.docs.map(doc => `<option value="${doc.id}" ${ticket.requesterId === doc.id ? 'selected' : ''}>${doc.id}: ${doc.data().name}</option>`).join(''); const locationsOptions = locSnap.docs.map(doc => `<option value="${doc.id}" ${ticket.locationId === doc.id ? 'selected' : ''}>${doc.id}: ${doc.data().name}</option>`).join(''); const devices = invSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })); const deviceOptions = devices.map(d => { const userText = d.user ? `(Usuario: ${d.user})` : ''; return `<option value="${d.id}">${d.id}: ${d.brand || ''} ${d.model || ''} ${userText}</option>`; }).join(''); let formHTML = `<h2>Editar Ticket ${ticketId}</h2><form id="edit-ticket-form"><div class="form-group"><label for="edit-title">Título</label><input type="text" id="edit-title" value="${ticket.title}" required></div><div class="form-group"><label>Descripción</label><div id="edit-description-editor"></div></div><div class="inventory-form-grid"><div class="form-group"><label for="edit-requester">Solicitante</label><select id="edit-requester" required>${requestersOptions}</select></div><div class="form-group"><label for="edit-location">Ubicación</label><select id="edit-location" required>${locationsOptions}</select></div><div class="form-group"><label for="edit-priority">Prioridad</label><select id="edit-priority"><option value="baja" ${ticket.priority === 'baja' ? 'selected' : ''}>Baja</option><option value="media" ${ticket.priority === 'media' ? 'selected' : ''}>Media</option><option value="alta" ${ticket.priority === 'alta' ? 'selected' : ''}>Alta</option></select></div><div class="form-group"><label for="edit-device-search">Dispositivo Asociado</label><input type="text" id="edit-device-search" list="edit-device-list" value="${ticket.deviceId || ''}"><datalist id="edit-device-list">${deviceOptions}</datalist></div></div><div style="text-align:right; margin-top:20px;"><button type="submit" class="primary">Guardar Cambios</button></div></form>`; modalBody.innerHTML = formHTML; const editor = new Quill('#edit-description-editor', { theme: 'snow' }); editor.root.innerHTML = ticket.description; formModal.classList.remove('hidden'); document.getElementById('edit-ticket-form').addEventListener('submit', async (e) => { e.preventDefault(); const form = e.target; const updatedData = { title: form.querySelector('#edit-title').value, description: editor.root.innerHTML, requesterId: form.querySelector('#edit-requester').value, locationId: form.querySelector('#edit-location').value, priority: form.querySelector('#edit-priority').value, deviceId: form.querySelector('#edit-device-search').value || null, }; try { await db.collection('tickets').doc(ticketId).update(updatedData); formModal.classList.add('hidden'); showTicketModal(ticketId); } catch (error) { console.error("Error al actualizar el ticket:", error); alert("No se pudo actualizar el ticket."); } }); }
async function showEditClosedAtModal(ticketId, currentClosedAt) {
    const actionModal = document.getElementById('action-modal');
    const modalBody = actionModal.querySelector('#action-modal-body');
    const closedAtValue = currentClosedAt ? currentClosedAt.toDate().toISOString().split('T')[0] : '';
    modalBody.innerHTML = `<h2>Editar Fecha de Cierre del Ticket ${ticketId}</h2><form id="edit-closed-at-form"><div class="form-group"><label for="closedAtDate">Fecha de Cierre</label><input type="date" id="closedAtDate" name="closedAtDate" value="${closedAtValue}"></div><div style="text-align: right; margin-top: 20px;"><button type="submit" class="primary">Guardar Fecha</button><button type="button" class="btn-secondary modal-close-btn" style="margin-left: 10px;">Cancelar</button></div></form>`;
    actionModal.classList.remove('hidden');
    document.getElementById('edit-closed-at-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const form = e.target;
        const newClosedAtDate = form.closedAtDate.value;
        try {
            if (newClosedAtDate) {
                const newClosedAtTimestamp = firebase.firestore.Timestamp.fromDate(new Date(newClosedAtDate + 'T00:00:00'));
                await db.collection('tickets').doc(ticketId).update({ closedAt: newClosedAtTimestamp });
            } else {
                await db.collection('tickets').doc(ticketId).update({ closedAt: null });
            }
            actionModal.classList.add('hidden');
            showTicketModal(ticketId);
        } catch (error) { console.error("Error al actualizar la fecha de cierre:", error); alert("No se pudo actualizar la fecha de cierre. Revisa la consola."); }
    });
}

async function showTicketModal(ticketId) {
    const ticketModal = document.getElementById('ticket-modal');
    const modalBody = ticketModal.querySelector('#modal-body');
    ticketModal.classList.remove('hidden');
    modalBody.innerHTML = '<p>Cargando detalles del ticket...</p>';

    const ticketDoc = await db.collection('tickets').doc(ticketId).get();
    if (!ticketDoc.exists) { alert('Error: No se encontró el ticket.'); ticketModal.classList.add('hidden'); return; }

    const ticket = { id: ticketDoc.id, ...ticketDoc.data() };
    const requesterName = ticket.requesterId ? (await db.collection('requesters').doc(ticket.requesterId).get()).data()?.name || ticket.requesterId : 'N/A';

    let devicesHTML = '';
    if (ticket.deviceIds && ticket.deviceIds.length > 0) {
        devicesHTML = `<div class="ticket-detail-item"><strong>Dispositivos:</strong><ul style="margin-top: 5px; padding-left: 20px;">${ticket.deviceIds.map(id => `<li>${id}</li>`).join('')}</ul></div>`;
    }

    let mainContentHTML = '';
    if (ticket.ticketType === 'velocity' || ticket.ticketType === 'siigo') {
        mainContentHTML = `<h4>Detalles del Reporte</h4><div class="ticket-details-grid"><div><strong>Fecha de Reporte:</strong> ${ticket.fechaDeReporte || 'N/A'}</div><div><strong>Hora de Reporte:</strong> ${ticket.horaDeReporte || 'N/A'}</div><div><strong>Medio de Solicitud:</strong> ${ticket.medioDeSolicitud || 'N/A'}</div><div><strong>Asesor de Soporte:</strong> ${ticket.asesorDeSoporte || 'N/A'}</div><div><strong>Ticket del Caso:</strong> ${ticket.ticketDelCaso || 'N/A'}</div></div><hr><h4>Descripción de la Novedad</h4><div class="card">${ticket.descripcionDeLaNovedad}</div>`;
    } else {
        mainContentHTML = `<h3>Descripción</h3><div class="card">${ticket.description}</div>`;
    }

    let historyHTML = '<h3>Historial de Avances</h3>';
    if (ticket.history && ticket.history.length > 0) {
        historyHTML += '<ul class="ticket-history-log">';
        ticket.history.sort((a, b) => b.timestamp.toMillis() - a.timestamp.toMillis());
        ticket.history.forEach(entry => { historyHTML += `<li><div class="history-meta">Registrado el: ${entry.timestamp.toDate().toLocaleString('es-ES')}</div><div class="history-text">${entry.text}</div></li>`; });
        historyHTML += '</ul>';
    } else {
        historyHTML += '<p>No hay avances registrados.</p>';
    }

    let actionsHTML = '';
    if (ticket.status === 'abierto' || ticket.status === 'en-curso') {
        actionsHTML = `<hr><h3>Añadir Avance</h3><form id="progress-form"><div class="form-group"><textarea id="progress-text" rows="3" placeholder="Describe el avance realizado..." required></textarea></div><button type="submit" class="btn-warning">Guardar Avance y Poner "En Curso"</button></form><hr><h3>Añadir Solución Final y Cerrar Ticket</h3><form id="solution-form"><div class="form-group"><div id="solution-editor"></div></div><button type="submit" class="primary">Guardar Solución y Cerrar</button></form>`;
    } else if (ticket.status === 'cerrado') {
        actionsHTML = `<hr><h3>Solución Aplicada</h3><div class="card">${ticket.solution || 'No se especificó solución.'}</div>`;
        if (ticket.solution) {
            actionsHTML += `<div style="text-align: right; margin-top: 15px;"><button id="create-kb-from-ticket-btn" class="btn-blue">📝 Crear Artículo de Conocimiento</button></div>`;
        }
    }

    let modalActions = `<div class="ticket-modal-actions">`;
    if ((ticket.status === 'abierto' || ticket.status === 'en-curso') && ticket.ticketType === 'ti') { modalActions += `<button id="edit-ticket-btn" class="btn-secondary">✏️ Editar Ticket</button>`; }
    if (ticket.status === 'cerrado') { modalActions += `<button id="reopen-ticket-btn" class="btn-warning">↩️ Reabrir Ticket</button>`; }
    if (ticket.closedAt) { modalActions += `<button id="edit-closed-at-date-btn" class="btn-secondary" style="margin-left:10px;">🗓️ Editar Fecha Cierre</button>`; }
    modalActions += `</div>`;

    modalBody.innerHTML = `<div class="ticket-modal-layout"><div class="ticket-modal-main"><h2>Ticket ${ticket.id} (${capitalizar(ticket.ticketType || 'TI')})</h2>${modalActions}<hr>${mainContentHTML}${historyHTML}${actionsHTML}</div><div class="ticket-modal-sidebar"><h3>Detalles del Ticket</h3><div class="ticket-detail-item"><strong>Estado:</strong> <span class="status status-${ticket.status}">${capitalizar(ticket.status.replace('-', ' '))}</span></div>${ticket.priority ? `<div class="ticket-detail-item"><strong>Prioridad:</strong> ${capitalizar(ticket.priority)}</div>` : ''}<div class="ticket-detail-item"><strong>Solicitante:</strong> ${requesterName}</div>${ticket.locationId ? `<div class="ticket-detail-item"><strong>Ubicación:</strong> ${ticket.locationId}</div>` : ''}<div class="ticket-detail-item"><strong>Creado:</strong> ${ticket.createdAt.toDate().toLocaleString('es-ES')}</div>${ticket.closedAt ? `<div class="ticket-detail-item"><strong>Cerrado:</strong> ${ticket.closedAt.toDate().toLocaleString('es-ES')}</div>` : ''}${devicesHTML}</div></div>`;

    if ((ticket.status === 'abierto' || ticket.status === 'en-curso') && ticket.ticketType === 'ti') { document.getElementById('edit-ticket-btn').addEventListener('click', () => { ticketModal.classList.add('hidden'); showEditTicketModal(ticket.id); }); }
    if (document.getElementById('edit-closed-at-date-btn')) { document.getElementById('edit-closed-at-date-btn').addEventListener('click', () => { ticketModal.classList.add('hidden'); showEditClosedAtModal(ticket.id, ticket.closedAt); }); }

    if (ticket.status === 'abierto' || ticket.status === 'en-curso') {
        document.getElementById('progress-form').addEventListener('submit', async (e) => { e.preventDefault(); const text = document.getElementById('progress-text').value; if (!text.trim()) return; const newHistoryEntry = { text: text, timestamp: firebase.firestore.FieldValue.serverTimestamp() }; await db.collection('tickets').doc(ticket.id).update({ status: 'en-curso', history: firebase.firestore.FieldValue.arrayUnion(newHistoryEntry) }); showTicketModal(ticket.id); });
        const solutionEditor = new Quill('#solution-editor', { theme: 'snow', placeholder: 'Describe la solución final aplicada...' });
        document.getElementById('solution-form').addEventListener('submit', e => { e.preventDefault(); db.collection('tickets').doc(ticket.id).update({ solution: solutionEditor.root.innerHTML, status: 'cerrado', closedAt: firebase.firestore.FieldValue.serverTimestamp() }).then(() => showTicketModal(ticket.id)); });
    }

    if (ticket.status === 'cerrado') {
        document.getElementById('reopen-ticket-btn').addEventListener('click', async () => { if (confirm('¿Estás seguro de que quieres reabrir este ticket?')) { const reopeningHistoryEntry = { text: `<strong>Ticket reabierto</strong> por el usuario.`, timestamp: firebase.firestore.Timestamp.fromDate(new Date()) }; try { await db.collection('tickets').doc(ticket.id).update({ status: 'abierto', closedAt: null, solution: null, history: firebase.firestore.FieldValue.arrayUnion(reopeningHistoryEntry) }); showTicketModal(ticket.id); } catch (error) { console.error("Error al reabrir el ticket:", error); alert("No se pudo reabrir el ticket."); } } });
        const createKbBtn = document.getElementById('create-kb-from-ticket-btn');
        if (createKbBtn) {
            createKbBtn.addEventListener('click', () => {
                const prefillData = { title: ticket.title, problem: ticket.description, solution: ticket.solution, type: 'article' };
                ticketModal.classList.add('hidden');
                showKnowledgeBaseFormModal(null, prefillData);
            });
        }
    }
}

async function renderKnowledgeBase(container) {
    container.innerHTML = knowledgeBaseHTML;
    const gridContainer = document.getElementById('kb-grid-container');
    const searchInput = document.getElementById('kb-search-input');
    
    document.getElementById('add-kb-article-btn').addEventListener('click', () => showKnowledgeBaseFormModal());
    document.getElementById('add-manual-btn').addEventListener('click', () => showManualFormModal());

    let articles = []; 

    db.collection('knowledge_base').orderBy('createdAt', 'desc').onSnapshot(snapshot => {
        gridContainer.innerHTML = '';
        if (snapshot.empty) { gridContainer.innerHTML = '<p>No hay artículos ni manuales en la base de conocimiento todavía.</p>'; return; }
        articles = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        displayArticles(articles);
    }, error => handleFirestoreError(error, gridContainer));

    function displayArticles(articlesToDisplay) {
        gridContainer.innerHTML = '';
        articlesToDisplay.forEach(article => {
            const card = document.createElement('div');
            const isManual = article.type === 'manual';
            card.className = `kb-card ${isManual ? 'manual-card' : ''}`;
            card.dataset.id = article.id;
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = article.solution;
            const solutionSnippet = tempDiv.textContent || tempDiv.innerText || "";
            card.innerHTML = `<h3>${article.title}</h3><span class="kb-category">${article.category || 'Sin categoría'}</span><div class="kb-solution-snippet">${solutionSnippet}</div>`;
            card.addEventListener('click', () => showKnowledgeBaseArticleModal(article.id));
            gridContainer.appendChild(card);
        });
    }

    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        if (!searchTerm) { displayArticles(articles); return; }
        const filteredArticles = articles.filter(article => article.title.toLowerCase().includes(searchTerm) || (article.category && article.category.toLowerCase().includes(searchTerm)) || article.solution.toLowerCase().includes(searchTerm) || (article.problem && article.problem.toLowerCase().includes(searchTerm)));
        displayArticles(filteredArticles);
    });
}

// --- MODIFICADO --- Se cambia el input de categoría por un select.
async function showKnowledgeBaseFormModal(docId = null, prefillData = {}) {
    const formModal = document.getElementById('form-modal');
    const modalBody = formModal.querySelector('#form-modal-body');
    const isEditing = docId !== null;
    let existingData = {};

    if (isEditing) {
        const docSnap = await db.collection('knowledge_base').doc(docId).get();
        if (docSnap.exists) { existingData = docSnap.data(); }
    } else {
        existingData = prefillData;
    }

    const { title = '', category = '', problem = '', solution = '' } = existingData;
    
    modalBody.innerHTML = `
        <h2>${isEditing ? 'Editar' : 'Crear'} Artículo de Conocimiento</h2>
        <form id="kb-form">
            <div class="form-group"><label for="kb-title">Título</label><input type="text" id="kb-title" value="${title}" required></div>
            <div class="form-group">
                <label for="kb-category">Categoría</label>
                <select id="kb-category" required>
                    <option value="" ${!category ? 'selected' : ''} disabled>Selecciona una categoría</option>
                    <option value="Redes" ${category === 'Redes' ? 'selected' : ''}>Redes</option>
                    <option value="Dispositivos" ${category === 'Dispositivos' ? 'selected' : ''}>Dispositivos</option>
                    <option value="Bases de Datos" ${category === 'Bases de Datos' ? 'selected' : ''}>Bases de Datos</option>
                    <option value="Programas" ${category === 'Programas' ? 'selected' : ''}>Programas</option>
                </select>
            </div>
            <div class="form-group"><label>Descripción del Problema/Síntoma</label><div id="kb-problem-editor" style="height: 150px;"></div></div>
            <div class="form-group"><label>Solución Paso a Paso</label><div id="kb-solution-editor" style="height: 250px;"></div></div>
            <div style="text-align: right; margin-top: 20px;"><button type="submit" class="primary">${isEditing ? 'Guardar Cambios' : 'Guardar Artículo'}</button></div>
        </form>
    `;

    const problemEditor = new Quill('#kb-problem-editor', { theme: 'snow' });
    problemEditor.root.innerHTML = problem;
    const solutionEditor = new Quill('#kb-solution-editor', { theme: 'snow' });
    solutionEditor.root.innerHTML = solution;

    formModal.classList.remove('hidden');

    document.getElementById('kb-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = {
            title: document.getElementById('kb-title').value,
            category: document.getElementById('kb-category').value,
            problem: problemEditor.root.innerHTML,
            solution: solutionEditor.root.innerHTML,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
            type: 'article'
        };

        try {
            if (isEditing) {
                await db.collection('knowledge_base').doc(docId).update(formData);
            } else {
                formData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
                await db.collection('knowledge_base').add(formData);
            }
            formModal.classList.add('hidden');
            if (window.location.hash === '#knowledge-base') {
                renderKnowledgeBase(document.getElementById('app-content'));
            }
        } catch (error) { console.error("Error guardando artículo:", error); alert("No se pudo guardar el artículo."); }
    });
}

// --- MODIFICADO --- Se cambia el input de categoría por un select.
async function showManualFormModal(docId = null) {
    const formModal = document.getElementById('form-modal');
    const modalBody = formModal.querySelector('#form-modal-body');
    const isEditing = docId !== null;
    let existingData = {};

    if (isEditing) {
        const docSnap = await db.collection('knowledge_base').doc(docId).get();
        if (docSnap.exists) { existingData = docSnap.data(); }
    }

    const { title = '', category = '', solution = '' } = existingData;

    modalBody.innerHTML = `
        <h2>${isEditing ? 'Editar' : 'Crear'} Manual</h2>
        <form id="manual-form">
            <div class="form-group"><label for="manual-title">Título del Manual</label><input type="text" id="manual-title" value="${title}" required></div>
            <div class="form-group">
                <label for="manual-category">Categoría</label>
                <select id="manual-category" required>
                    <option value="" ${!category ? 'selected' : ''} disabled>Selecciona una categoría</option>
                    <option value="Redes" ${category === 'Redes' ? 'selected' : ''}>Redes</option>
                    <option value="Dispositivos" ${category === 'Dispositivos' ? 'selected' : ''}>Dispositivos</option>
                    <option value="Bases de Datos" ${category === 'Bases de Datos' ? 'selected' : ''}>Bases de Datos</option>
                    <option value="Programas" ${category === 'Programas' ? 'selected' : ''}>Programas</option>
                </select>
            </div>
            <div class="form-group"><label>Paso a Paso</label><div id="manual-solution-editor" style="height: 400px;"></div></div>
            <div style="text-align: right; margin-top: 20px;"><button type="submit" class="primary">${isEditing ? 'Guardar Cambios' : 'Guardar Manual'}</button></div>
        </form>
    `;

    const solutionEditor = new Quill('#manual-solution-editor', { theme: 'snow' });
    solutionEditor.root.innerHTML = solution;

    formModal.classList.remove('hidden');

    document.getElementById('manual-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = {
            title: document.getElementById('manual-title').value,
            category: document.getElementById('manual-category').value,
            solution: solutionEditor.root.innerHTML,
            problem: '',
            updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
            type: 'manual'
        };

        try {
            if (isEditing) {
                await db.collection('knowledge_base').doc(docId).update(formData);
            } else {
                formData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
                await db.collection('knowledge_base').add(formData);
            }
            formModal.classList.add('hidden');
            if (window.location.hash === '#knowledge-base') {
                renderKnowledgeBase(document.getElementById('app-content'));
            }
        } catch (error) { console.error("Error guardando manual:", error); alert("No se pudo guardar el manual."); }
    });
}

async function showKnowledgeBaseArticleModal(docId) {
    const actionModal = document.getElementById('action-modal');
    const modalBody = actionModal.querySelector('#action-modal-body');
    actionModal.classList.remove('hidden');
    modalBody.innerHTML = '<p>Cargando...</p>';

    try {
        const docSnap = await db.collection('knowledge_base').doc(docId).get();
        if (!docSnap.exists) { modalBody.innerHTML = '<p>Error: No encontrado.</p>'; return; }
        const article = docSnap.data();
        const isManual = article.type === 'manual';

        let contentHTML = '';
        if (isManual) {
            contentHTML = `<h3>Paso a Paso</h3><div class="card">${article.solution}</div>`;
        } else {
            contentHTML = `<h3>Problema</h3><div class="card">${article.problem}</div><h3>Solución</h3><div class="card">${article.solution}</div>`;
        }

        modalBody.innerHTML = `
            <h2>${article.title}</h2>
            <p><span class="kb-category">${article.category}</span></p>
            <div class="kb-article-content">${contentHTML}</div>
            <div style="text-align: right; margin-top: 20px; display: flex; gap: 10px; justify-content: flex-end;">
                <button id="edit-kb-btn" class="btn-secondary">✏️ Editar</button>
                <button id="delete-kb-btn" class="danger">🗑️ Eliminar</button>
            </div>
        `;

        document.getElementById('edit-kb-btn').addEventListener('click', () => {
            actionModal.classList.add('hidden');
            if (isManual) { showManualFormModal(docId); } else { showKnowledgeBaseFormModal(docId); }
        });
        document.getElementById('delete-kb-btn').addEventListener('click', async () => {
            if (confirm(`¿Estás seguro de que quieres eliminar est${isManual ? 'e manual' : 'e artículo'}?`)) {
                await db.collection('knowledge_base').doc(docId).delete();
                actionModal.classList.add('hidden');
                renderKnowledgeBase(document.getElementById('app-content'));
            }
        });
    } catch (error) { console.error("Error cargando:", error); modalBody.innerHTML = '<p>Error al cargar.</p>'; }
}


// --- 7. AUTENTICACIÓN Y PUNTO DE ENTRADA ---
document.addEventListener('DOMContentLoaded', () => {
    const appContent = document.getElementById('app-content');
    const navList = document.querySelector('.nav-list');
    const ticketModal = document.getElementById('ticket-modal');
    const formModal = document.getElementById('form-modal');
    const actionModal = document.getElementById('action-modal');
    const historyModal = document.getElementById('history-modal');
    
    const routes = {
        '#dashboard': renderDashboard,
        '#crear-ticket-ti': renderNewTITicketForm,
        '#crear-ticket-velocity': (container) => renderNewPlatformTicketForm(container, 'Velocity'),
        '#crear-ticket-siigo': (container) => renderNewPlatformTicketForm(container, 'Siigo'),
        '#tickets': renderTicketList,
        '#historial': renderHistoryPage,
        '#knowledge-base': renderKnowledgeBase,
        '#estadisticas': renderEstadisticas,
        '#maintenance': renderMaintenanceCalendar,
        '#configuracion': renderConfiguracion
    };
    function router() { const fullHash = window.location.hash || '#dashboard'; const [path, queryString] = fullHash.split('?'); const params = new URLSearchParams(queryString); let isHandled = false; if (path.startsWith('#inventory-')) { const category = path.replace('#inventory-', ''); params.set('category', category); renderGenericListPage(appContent, Object.fromEntries(params.entries()), inventoryCategoryConfig, 'inventory', '💻'); isHandled = true; } else if (path.startsWith('#credentials-')) { const category = path.replace('#credentials-', ''); params.set('category', category); renderGenericListPage(appContent, Object.fromEntries(params.entries()), credentialsCategoryConfig, 'credentials', '🔑'); isHandled = true; } else if (path.startsWith('#services-')) { const category = path.replace('#services-', ''); params.set('category', category); renderGenericListPage(appContent, Object.fromEntries(params.entries()), servicesCategoryConfig, 'services', '📡'); isHandled = true; } else { const renderFunction = routes[path]; if (renderFunction) { appContent.innerHTML = '<div class="card"><h1>Cargando...</h1></div>'; renderFunction(appContent, Object.fromEntries(params.entries())); } else { appContent.innerHTML = '<h1>404 - Página no encontrada</h1>'; } } document.querySelectorAll('.nav-list .nav-item-with-submenu').forEach(item => item.classList.remove('open')); document.querySelectorAll('.nav-list .nav-link, .nav-list a').forEach(link => link.classList.remove('active')); const activeLink = document.querySelector(`.nav-list a[href="${fullHash}"]`); if (activeLink) { activeLink.classList.add('active'); let current = activeLink.parentElement; while (current && current.closest('.nav-list')) { if (current.matches('.nav-item-with-submenu')) { current.classList.add('open'); const parentToggleLink = current.querySelector(':scope > a'); if(parentToggleLink) parentToggleLink.classList.add('active'); } current = current.parentElement; } } else { const dashboardLink = document.querySelector('.nav-list a[href="#dashboard"]'); if (dashboardLink) dashboardLink.classList.add('active'); } }
    document.body.addEventListener('click', e => { const target = e.target.closest('button, span.edit-btn, span.delete-btn, span.history-btn, a.view-ticket-btn, .modal-close-btn'); if (!target) return; if (target.matches('.modal-close-btn')) { target.closest('.modal-overlay').classList.add('hidden'); } if (target.matches('.delete-btn, .delete-btn *')) { const button = target.closest('.delete-btn'); const id = button.dataset.id; const collection = button.dataset.collection; if (confirm(`¿Seguro que quieres eliminar este elemento?`)) { db.collection(collection).doc(id).delete(); } return; } if (target.matches('.edit-btn, .edit-btn *')) { const button = target.closest('.edit-btn'); const docId = button.dataset.id; const collectionName = button.dataset.collection; const category = button.dataset.category; const type = button.dataset.type; showItemFormModal(type || collectionName, category || collectionName, docId); return; } if (target.matches('.history-btn, .history-btn *')) { const deviceId = target.closest('.history-btn').dataset.id; showDeviceHistoryModal(deviceId); return; } if (target.matches('.view-ticket-btn, .view-ticket-btn *')) { e.preventDefault(); const id = target.closest('.view-ticket-btn').dataset.id; if (!historyModal.classList.contains('hidden')) { historyModal.classList.add('hidden'); } showTicketModal(id); } if (target.closest('button')?.classList.contains('open-form-modal-btn') || target.id === 'add-item-btn') { const button = target.closest('button'); const type = button.dataset.type; const category = button.dataset.category; showItemFormModal(type, category, null); } if (target.closest('button')?.classList.contains('export-btn')) { const format = target.dataset.format; const table = document.getElementById('data-table'); if (!table) { alert("Error: No se pudo encontrar la tabla con ID 'data-table' para exportar."); return; } let titleElement = document.getElementById('page-title') || document.getElementById('tickets-list-title') || document.getElementById('item-list-title') || document.getElementById('history-results-title') || document.querySelector('h1'); const filename = titleElement ? titleElement.textContent.trim() : 'reporte'; const tableId = table.id; if (format === 'csv') { exportToCSV(tableId, filename); } else if (format === 'pdf') { exportToPDF(tableId, filename); } } });
    ticketModal.addEventListener('click', e => { if (e.target === ticketModal) ticketModal.classList.add('hidden'); });
    formModal.addEventListener('click', e => { if (e.target === formModal) formModal.classList.add('hidden'); });
    actionModal.addEventListener('click', e => { if (e.target === actionModal) actionModal.classList.add('hidden'); });
    historyModal.addEventListener('click', e => { if (e.target === historyModal) historyModal.classList.add('hidden'); });
    const loginContainer = document.getElementById('login-container');
    const appContainer = document.getElementById('app-container');
    loginContainer.innerHTML = `<div class="login-box"><img src="https://glpipb.github.io/logo.png" alt="Logo" class="login-logo"><h2>Iniciar Sesión</h2><input type="email" id="email" placeholder="Correo electrónico"><input type="password" id="password" placeholder="Contraseña"><button id="login-btn">Entrar</button><p id="login-error" class="error-message"></p></div>`;
    document.getElementById('login-btn').addEventListener('click', () => { const email = document.getElementById('email').value; const password = document.getElementById('password').value; const errorEl = document.getElementById('login-error'); errorEl.textContent = ''; auth.signInWithEmailAndPassword(email, password).catch(error => { console.error("Error de inicio de sesión:", error); errorEl.textContent = "Correo o contraseña incorrectos."; }); });
    auth.onAuthStateChanged(user => { if (user) { loginContainer.classList.remove('visible'); loginContainer.classList.add('hidden'); appContainer.classList.add('visible'); appContainer.classList.remove('hidden'); if (navList && !navList.dataset.listenerAttached) { navList.addEventListener('click', (e) => { const toggleLink = e.target.closest('.nav-item-with-submenu > a'); if (toggleLink && toggleLink.nextElementSibling && toggleLink.nextElementSibling.classList.contains('submenu')) { e.preventDefault(); const parentLi = toggleLink.parentElement; parentLi.classList.toggle('open'); } }); navList.dataset.listenerAttached = 'true'; } window.addEventListener('hashchange', router); router(); document.getElementById('logout-btn').addEventListener('click', () => auth.signOut()); } else { loginContainer.classList.add('visible'); loginContainer.classList.remove('hidden'); appContainer.classList.remove('visible'); appContainer.classList.add('hidden'); window.removeEventListener('hashchange', router); } });
});
