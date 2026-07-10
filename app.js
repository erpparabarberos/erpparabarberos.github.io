(() => {
    // --- 1. CONFIGURACIÓN DE FIREBASE (TU ERP PRINCIPAL) ---
    const firebaseConfig = {
      apiKey: "AIzaSyDkH2_E7t07SWWH1SZr77BFlNp6RQTDDDY",
      authDomain: "erpparabarberos-12de9.firebaseapp.com",
      projectId: "erpparabarberos-12de9",
      storageBucket: "erpparabarberos-12de9.firebasestorage.app",
      messagingSenderId: "722745790519",
      appId: "1:722745790519:web:7bf1dbe172433898a56fb2"
    };

    // --- 2. INICIALIZACIÓN ---
    if (!firebase.apps.length) { firebase.initializeApp(firebaseConfig); }
    const db = firebase.firestore();
    const auth = firebase.auth();
    window.jsPDF = window.jspdf.jsPDF;

    // --- 3. TEMPLATES HTML ---
    const dashboardHTML = `
<section class="pb-dashboard">

    <div class="pb-dashboard-header">
        <div>
            <h1>Panel de control</h1>
            <p>Resumen general de la gestión de soportes y actividad del módulo.</p>
        </div>

        <div class="pb-dashboard-filters">
            <input type="date" id="dashboard-date-filter">
            <select id="dashboard-requester-filter">
                <option value="">Todos los solicitantes</option>
            </select>
        </div>
    </div>

    <div class="pb-dashboard-grid-top">

        <div class="pb-card pb-chart-card">
            <div class="pb-card-header">
                <h3>Tendencia de soportes</h3>
                <select id="dashboard-range-filter">
                    <option value="7">Últimos 7 días</option>
                    <option value="15">Últimos 15 días</option>
                    <option value="30">Últimos 30 días</option>
                </select>
            </div>
            <div class="pb-chart-container">
                <canvas id="supportTrendChart"></canvas>
            </div>
        </div>

        <div class="pb-card pb-heatmap-card">
            <div class="pb-card-header">
                <h3>Actividad mensual</h3>
                <span id="dashboard-month-label">Mes actual</span>
            </div>
            <div id="monthly-activity-grid" class="pb-month-grid"></div>
            <div class="pb-heatmap-legend">
                <span><i class="level-0"></i>0</span>
                <span><i class="level-1"></i>1–5</span>
                <span><i class="level-2"></i>6–10</span>
                <span><i class="level-3"></i>11–20</span>
                <span><i class="level-4"></i>20+</span>
            </div>
        </div>

        <div class="pb-card pb-summary-card">
            <h3>Resumen general</h3>

            <div class="pb-summary-item blue">
                <div class="pb-summary-icon">▣</div>
                <div>
                    <span>Total del mes</span>
                    <strong id="dash-total-month">0</strong>
                </div>
            </div>

            <div class="pb-summary-item green">
                <div class="pb-summary-icon">◷</div>
                <div>
                    <span>Tiempo invertido</span>
                    <strong id="dash-time-month">0h 0m</strong>
                </div>
            </div>

            <div class="pb-summary-item purple">
                <div class="pb-summary-icon">✓</div>
                <div>
                    <span>Casos cerrados</span>
                    <strong id="dash-closed-month">0</strong>
                </div>
            </div>

            <div class="pb-summary-item orange">
                <div class="pb-summary-icon">⌛</div>
                <div>
                    <span>Casos en seguimiento</span>
                    <strong id="dash-followup-month">0</strong>
                </div>
            </div>

            <a href="#estadisticas" class="pb-report-link">Ver reporte completo →</a>
        </div>

    </div>

    <div class="pb-kpi-row">
        <div class="pb-kpi-card blue">
            <span>Total del mes</span>
            <strong id="kpi-total-month">0</strong>
            <small>Soportes registrados</small>
        </div>

        <div class="pb-kpi-card green">
            <span>Tiempo invertido</span>
            <strong id="kpi-time-month">0h 0m</strong>
            <small>Tiempo total registrado</small>
        </div>

        <div class="pb-kpi-card purple">
            <span>Casos cerrados</span>
            <strong id="kpi-closed-month">0</strong>
            <small>Finalizados este mes</small>
        </div>

        <div class="pb-kpi-card orange">
            <span>Casos en seguimiento</span>
            <strong id="kpi-followup-month">0</strong>
            <small>Velocity, Siigo o pendientes</small>
        </div>
    </div>

    <div class="pb-dashboard-grid-bottom">

        <div class="pb-card">
            <div class="pb-card-header">
                <h3>Solicitantes frecuentes</h3>
                <a href="#tickets">Ver todos →</a>
            </div>
            <div id="top-requesters-dashboard" class="pb-requester-list"></div>
        </div>

        <div class="pb-card">
            <div class="pb-card-header">
                <h3>Categorías más comunes</h3>
            </div>
            <div class="pb-category-layout">
                <div class="pb-donut-wrap">
                    <canvas id="categoryDashboardChart"></canvas>
                </div>
                <div id="category-dashboard-list" class="pb-category-list"></div>
            </div>
        </div>

        <div class="pb-card">
            <div class="pb-card-header">
                <h3>Actividad reciente</h3>
                <a href="#tickets">Ver todo →</a>
            </div>
            <div id="recent-activity-dashboard" class="pb-activity-list"></div>
        </div>

    </div>

</section>
`;

const newTITicketFormHTML = `
<section class="support-page">

  <div class="support-header">
    <div>
      <h1>Registrar soporte realizado</h1>
      <p>Registra rápidamente los soportes que ya fueron resueltos.</p>
    </div>
  </div>

  <div class="support-type-cards">
    <a class="support-type-card active" href="#crear-ticket-ti">
      <span class="support-icon">🎧</span>
      <strong>Soporte TI</strong>
      <small>Soportes generales de tecnología</small>
    </a>

    <a class="support-type-card" href="#crear-ticket-velocity">
      <span class="support-icon orange">⚡</span>
      <strong>Velocity</strong>
      <small>Casos relacionados con Velocity</small>
    </a>

    <a class="support-type-card" href="#crear-ticket-siigo">
      <span class="support-icon cyan">S</span>
      <strong>Siigo</strong>
      <small>Casos relacionados con Siigo</small>
    </a>

    <a class="support-type-card" href="#nota-rapida">
      <span class="support-icon purple">📝</span>
      <strong>Nota rápida</strong>
      <small>Guardar una novedad pendiente</small>
    </a>

    <a class="support-type-card" href="#soportes-atrasados">
      <span class="support-icon red">⏱</span>
      <strong>Soportes atrasados</strong>
      <small>Cargar registros pendientes</small>
    </a>
  </div>

  <div class="support-layout">

    <div class="support-form-card">
      <form id="new-ticket-form">

        <div class="support-grid two">
          <div class="form-group">
            <label for="support-date">Fecha</label>
            <input type="date" id="support-date" required>
          </div>

          <div class="form-group">
            <label for="support-time">Hora</label>
            <input type="time" id="support-time" required>
          </div>
        </div>

        <div class="support-grid two">
          <div class="form-group">
            <label for="requester">Solicitante</label>
            <select id="requester" required></select>
          </div>

          <div class="form-group">
            <label for="location">Sede</label>
            <select id="location" required></select>
          </div>
        </div>

        <div class="support-grid two">
          <div class="form-group">
            <label for="support-type">Tipo de soporte</label>
            <select id="support-type" required>
              <option value="ti">Soporte TI</option>
            </select>
          </div>

          <div class="form-group">
            <label for="category">Categoría</label>
            <select id="category" required>
              <option value="">Selecciona una categoría</option>
              <option value="impresora">Impresora</option>
              <option value="equipo-lento">Equipo lento</option>
              <option value="internet">Internet</option>
              <option value="correo">Correo</option>
              <option value="camara">Cámara</option>
              <option value="instalacion">Instalación / configuración</option>
              <option value="usuario-contrasena">Usuario o contraseña</option>
              <option value="app-interna">App interna</option>
              <option value="otro">Otro</option>
            </select>
          </div>
        </div>

        <div class="quick-categories">
          <button type="button" class="quick-chip" data-category="impresora" data-text="La impresora presentó fallas al momento de imprimir.">No imprime</button>
          <button type="button" class="quick-chip" data-category="equipo-lento" data-text="El equipo presentó lentitud durante su uso.">Equipo lento</button>
          <button type="button" class="quick-chip" data-category="internet" data-text="Se presentó novedad con la conexión a internet.">Sin internet</button>
          <button type="button" class="quick-chip" data-category="correo" data-text="Se presentó novedad con el correo electrónico.">Correo</button>
          <button type="button" class="quick-chip" data-category="camara" data-text="Se presentó novedad con una cámara o visualización de cámaras.">Cámara</button>
          <button type="button" class="quick-chip" data-category="instalacion" data-text="Se realizó instalación o configuración requerida.">Instalación</button>
          <button type="button" class="quick-chip" data-category="otro" data-text="">Otro</button>
        </div>

        <div class="form-group">
          <label for="novelty">Novedad</label>
          <textarea id="novelty" rows="3" placeholder="Describe brevemente la novedad reportada..." required></textarea>
        </div>

        <div class="support-grid two">
          <div class="form-group">
            <label for="management">Gestión realizada</label>
            <textarea id="management" rows="4" placeholder="¿Qué acciones realizaste para atender el caso?" required></textarea>
          </div>

          <div class="form-group">
            <label for="solution">Solución aplicada</label>
            <textarea id="solution" rows="4" placeholder="¿Cuál fue la solución o resultado?" required></textarea>
          </div>
        </div>

        <div class="support-grid two">
          <div class="form-group">
            <label for="time-spent">Tiempo invertido</label>
            <select id="time-spent" required>
              <option value="">Selecciona el tiempo</option>
              <option value="5">5 minutos</option>
              <option value="10">10 minutos</option>
              <option value="15">15 minutos</option>
              <option value="20">20 minutos</option>
              <option value="30">30 minutos</option>
              <option value="45">45 minutos</option>
              <option value="60">1 hora</option>
              <option value="90">1 hora 30 minutos</option>
              <option value="120">2 horas</option>
            </select>
          </div>

          <div class="form-group">
            <label for="associated-device">Equipo asociado <span>(opcional)</span></label>
            <input type="text" id="associated-device" list="device-list" placeholder="Busca por código, usuario o marca...">
            <datalist id="device-list"></datalist>
          </div>
        </div>

        <div class="support-actions">
          <button type="submit" class="primary support-primary-btn">Registrar soporte</button>
          <button type="reset" class="support-secondary-btn">Limpiar formulario</button>
        </div>

      </form>
    </div>

    <aside class="support-side-panel">

      <div class="support-summary-card">
        <h3>Resumen de registros</h3>
        <div class="support-kpis">
          <div>
            <strong id="today-supports">0</strong>
            <span>Hoy</span>
          </div>
          <div>
            <strong id="week-supports">0</strong>
            <span>Semana</span>
          </div>
          <div>
            <strong id="month-supports">0</strong>
            <span>Mes</span>
          </div>
        </div>
      </div>

      <div class="support-warning-card">
        <strong>No dejes soportes sin registrar hoy</strong>
        <p>Mantener los registros al día ayuda a mejorar la trazabilidad del área.</p>
      </div>

      <div class="support-success-card">
        <strong>Cerrado automáticamente</strong>
        <p>Los soportes de TI se cierran automáticamente al momento de registrarlos.</p>
      </div>

      <div class="support-tips-card">
        <h3>Consejos rápidos</h3>
        <ul>
          <li>Sé específica en la novedad.</li>
          <li>Registra la solución aplicada.</li>
          <li>Asocia el equipo cuando sea posible.</li>
          <li>El tiempo invertido mejora tus reportes.</li>
        </ul>
      </div>

    </aside>

  </div>
</section>
`;
    const newPlatformTicketFormHTML = `
<section class="support-page">

  <div class="support-header">
    <div>
      <h1 id="page-title">Registrar caso</h1>
      <p id="page-subtitle">Guarda lo que gestionaste y deja el caso en seguimiento.</p>
    </div>
  </div>

  <div class="support-type-cards">
    <a class="support-type-card" href="#crear-ticket-ti">
      <span class="support-icon">🎧</span>
      <strong>Soporte TI</strong>
      <small>Soportes generales de tecnología</small>
    </a>

    <a class="support-type-card" id="card-velocity" href="#crear-ticket-velocity">
      <span class="support-icon orange">⚡</span>
      <strong>Velocity</strong>
      <small>Casos de plataforma externa</small>
    </a>

    <a class="support-type-card" id="card-siigo" href="#crear-ticket-siigo">
      <span class="support-icon cyan">S</span>
      <strong>Siigo</strong>
      <small>Casos de plataforma externa</small>
    </a>

    <a class="support-type-card" href="#nota-rapida">
      <span class="support-icon purple">📝</span>
      <strong>Nota rápida</strong>
      <small>Guardar algo pendiente</small>
    </a>

    <a class="support-type-card" href="#soportes-atrasados">
      <span class="support-icon red">⏱</span>
      <strong>Soportes atrasados</strong>
      <small>Cargar pendientes</small>
    </a>
  </div>

  <div class="support-layout">

    <div class="support-form-card">
      <form id="new-platform-ticket-form">

        <div class="support-grid two">
          <div class="form-group">
            <label for="fecha-reporte">Fecha</label>
            <input type="date" id="fecha-reporte" required>
          </div>

          <div class="form-group">
            <label for="hora-reporte">Hora</label>
            <input type="time" id="hora-reporte" required>
          </div>
        </div>

        <div class="support-grid two">
          <div class="form-group">
            <label for="solicitante">Solicitante</label>
            <select id="solicitante" required></select>
          </div>

          <div class="form-group">
            <label for="location">Sede</label>
            <select id="location" required></select>
          </div>
        </div>

        <div class="support-grid two">
          <div class="form-group">
            <label for="medio-solicitud">Medio</label>
            <select id="medio-solicitud" required></select>
          </div>

          <div class="form-group">
            <label for="estado-proveedor">Estado</label>
            <select id="estado-proveedor" required>
              <option value="reportado-proveedor">Reportado al proveedor</option>
              <option value="esperando-respuesta">Esperando respuesta</option>
              <option value="en-seguimiento">En seguimiento</option>
            </select>
          </div>
        </div>

        <div class="support-grid two">
          <div class="form-group">
            <label for="asesor-soporte">Asesor / canal</label>
            <input type="text" id="asesor-soporte" placeholder="Nombre del asesor o canal">
          </div>

          <div class="form-group">
            <label for="ticket-caso">Caso externo <span>(opcional)</span></label>
            <input type="text" id="ticket-caso" placeholder="Número de caso, ticket o radicado">
          </div>
        </div>

        <div class="form-group">
          <label for="descripcion-novedad">Novedad</label>
          <textarea id="descripcion-novedad" rows="3" placeholder="Describe qué pasó..." required></textarea>
        </div>

        <div class="support-grid two">
          <div class="form-group">
            <label for="gestion-realizada">Gestión realizada</label>
            <textarea id="gestion-realizada" rows="4" placeholder="¿Qué hiciste o reportaste?" required></textarea>
          </div>
          
        <div class="form-group">
          <label for="respuesta-proveedor">Respuesta del proveedor <span>(opcional)</span></label>
          <textarea id="respuesta-proveedor" rows="4" placeholder="Déjalo vacío si el proveedor aún no responde..."></textarea>
          </div>
        </div>

        <div class="support-grid two">
          <div class="form-group">
            <label for="time-spent">Tiempo invertido</label>
            <select id="time-spent" required>
              <option value="">Selecciona el tiempo</option>
              <option value="5">5 minutos</option>
              <option value="10">10 minutos</option>
              <option value="15">15 minutos</option>
              <option value="20">20 minutos</option>
              <option value="30">30 minutos</option>
              <option value="45">45 minutos</option>
              <option value="60">1 hora</option>
              <option value="90">1 hora 30 minutos</option>
              <option value="120">2 horas</option>
            </select>
          </div>

          <div class="form-group">
            <label for="category">Categoría</label>
            <select id="category" required>
              <option value="">Selecciona una categoría</option>
              <option value="facturacion">Facturación</option>
              <option value="inventario">Inventario</option>
              <option value="usuarios">Usuarios / accesos</option>
              <option value="error-sistema">Error del sistema</option>
              <option value="configuracion">Configuración</option>
              <option value="otro">Otro</option>
            </select>
          </div>
        </div>

        <div class="support-actions">
          <button type="submit" class="primary support-primary-btn">Registrar caso</button>
          <button type="reset" class="support-secondary-btn">Limpiar formulario</button>
        </div>

      </form>
    </div>

    <aside class="support-side-panel">

      <div class="support-summary-card">
        <h3 id="platform-summary-title">Caso en seguimiento</h3>
        <p style="color:#64748b; line-height:1.6; margin:0;">
          Este registro queda abierto porque depende del proveedor.
        </p>
      </div>

      <div class="support-warning-card">
        <strong>No depende de ti</strong>
        <p>Solo registra lo que gestionaste y el estado en el que quedó.</p>
      </div>

      <div class="support-success-card">
        <strong>Queda en seguimiento</strong>
        <p>No se cierra todavía. Se mantiene abierto hasta que el proveedor responda o solucione.</p>
      </div>

      <div class="support-tips-card">
        <h3>Tips rápidos</h3>
        <ul>
          <li>Guarda el número de caso si existe.</li>
          <li>Escribe por dónde lo reportaste.</li>
          <li>Registra la respuesta del proveedor.</li>
          <li>Después lo cerramos cuando ya esté solucionado.</li>
        </ul>
      </div>

    </aside>

  </div>
</section>
`;
    const quickNoteHTML = `
<section class="support-page">

  <div class="support-header">
    <div>
      <h1>Nota rápida</h1>
      <p>Guarda una novedad en segundos para completarla después.</p>
    </div>
  </div>

  <div class="support-type-cards">
    <a class="support-type-card" href="#crear-ticket-ti">
      <span class="support-icon">🎧</span>
      <strong>Soporte TI</strong>
      <small>Soportes generales de tecnología</small>
    </a>

    <a class="support-type-card" href="#crear-ticket-velocity">
      <span class="support-icon orange">⚡</span>
      <strong>Velocity</strong>
      <small>Casos de plataforma externa</small>
    </a>

    <a class="support-type-card" href="#crear-ticket-siigo">
      <span class="support-icon cyan">S</span>
      <strong>Siigo</strong>
      <small>Casos de plataforma externa</small>
    </a>

    <a class="support-type-card active" href="#nota-rapida">
      <span class="support-icon purple">📝</span>
      <strong>Nota rápida</strong>
      <small>Guardar algo pendiente</small>
    </a>

    <a class="support-type-card" href="#soportes-atrasados">
      <span class="support-icon red">⏱</span>
      <strong>Soportes atrasados</strong>
      <small>Cargar pendientes</small>
    </a>
  </div>

  <div class="support-layout">

    <div class="support-form-card">
      <form id="quick-note-form">

        <div class="support-grid two">
          <div class="form-group">
            <label for="note-date">Fecha</label>
            <input type="date" id="note-date" required>
          </div>

          <div class="form-group">
            <label for="note-time">Hora</label>
            <input type="time" id="note-time" required>
          </div>
        </div>

        <div class="support-grid two">
          <div class="form-group">
            <label for="note-type">Relacionado con</label>
            <select id="note-type" required>
              <option value="ti">Soporte TI</option>
              <option value="velocity">Velocity</option>
              <option value="siigo">Siigo</option>
              <option value="otro">Otro</option>
            </select>
          </div>

          <div class="form-group">
            <label for="note-requester">Solicitante <span>(opcional)</span></label>
            <select id="note-requester">
              <option value="">Selecciona un solicitante</option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label for="note-text">Nota</label>
          <textarea id="note-text" rows="7" placeholder="Ej: Diana - Velocity no deja facturar - reportado a proveedor..." required></textarea>
        </div>

        <div class="support-actions">
          <button type="submit" class="primary support-primary-btn">Guardar nota</button>
          <button type="reset" class="support-secondary-btn">Limpiar</button>
        </div>

      </form>
    </div>

    <aside class="support-side-panel">
      <div class="support-warning-card">
        <strong>Para no olvidar</strong>
        <p>Esta nota queda pendiente para que después la conviertas en soporte completo.</p>
      </div>

      <div class="support-success-card">
        <strong>Registro rápido</strong>
        <p>Úsala cuando no tengas tiempo de llenar todo el formulario.</p>
      </div>

      <div class="support-tips-card">
        <h3>Ejemplo</h3>
        <ul>
          <li>Nombre de la persona.</li>
          <li>Sistema o equipo afectado.</li>
          <li>Qué pasó.</li>
          <li>Qué hiciste o qué quedó pendiente.</li>
        </ul>
      </div>
    </aside>

  </div>
</section>
`;
    const backlogSupportsHTML = `
<section class="support-page">

  <div class="support-header">
    <div>
      <h1>Soportes atrasados</h1>
      <p>Carga varios soportes pendientes en una sola tabla.</p>
    </div>
  </div>

  <div class="support-type-cards">
    <a class="support-type-card" href="#crear-ticket-ti">
      <span class="support-icon">🎧</span>
      <strong>Soporte TI</strong>
      <small>Soportes generales de tecnología</small>
    </a>

    <a class="support-type-card" href="#crear-ticket-velocity">
      <span class="support-icon orange">⚡</span>
      <strong>Velocity</strong>
      <small>Casos de plataforma externa</small>
    </a>

    <a class="support-type-card" href="#crear-ticket-siigo">
      <span class="support-icon cyan">S</span>
      <strong>Siigo</strong>
      <small>Casos de plataforma externa</small>
    </a>

    <a class="support-type-card" href="#nota-rapida">
      <span class="support-icon purple">📝</span>
      <strong>Nota rápida</strong>
      <small>Guardar algo pendiente</small>
    </a>

    <a class="support-type-card active" href="#soportes-atrasados">
      <span class="support-icon red">⏱</span>
      <strong>Soportes atrasados</strong>
      <small>Cargar pendientes</small>
    </a>
  </div>

  <div class="support-form-card backlog-card">
    <div class="backlog-actions-top">
      <button type="button" id="add-backlog-row" class="support-secondary-btn">Agregar fila</button>
      <button type="button" id="save-backlog-supports" class="primary support-primary-btn">Guardar todos</button>
    </div>

    <div class="backlog-table-wrapper">
      <table class="backlog-table">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Hora</th>
            <th>Tipo</th>
            <th>Solicitante</th>
            <th>Sede</th>
            <th>Categoría</th>
            <th>Novedad</th>
            <th>Gestión</th>
            <th>Solución / respuesta</th>
            <th>Tiempo</th>
            <th>Estado</th>
            <th></th>
          </tr>
        </thead>
        <tbody id="backlog-table-body"></tbody>
      </table>
    </div>
  </div>

</section>
`;
    const ticketListHTML = `<div class="add-new-button-container"><button class="export-btn csv" data-format="csv">Exportar a Excel (CSV)</button><button class="export-btn pdf" data-format="pdf">Exportar a PDF</button></div><div class="card"><h2 id="tickets-list-title">Todos los Tickets</h2><div class="table-wrapper"><table id="data-table"><thead><tr><th># Ticket</th><th>Tipo</th><th>Título/Novedad</th><th>Solicitante</th><th>Fecha Creación</th><th>Fecha Cierre</th><th>Estado</th><th>Acciones</th></tr></thead><tbody></tbody></table></div></div>`;
    const historyPageHTML = `
<section class="history-modern-page">

    <div class="history-modern-header">
        <div class="history-modern-title">
            <div class="history-title-icon">🔎</div>
            <div>
                <h1>Historial de soportes</h1>
                <p>Resumen de actividad y casos registrados.</p>
            </div>
        </div>

        <div class="history-export-actions">
            <button class="history-export-btn excel export-btn csv" data-format="csv">Exportar Excel</button>
            <button class="history-export-btn pdf export-btn pdf" data-format="pdf">Exportar PDF</button>
        </div>
    </div>

    <div class="history-kpi-grid">
        <div class="history-kpi-card blue">
            <div class="history-kpi-icon">🎫</div>
            <div>
                <strong id="history-total-count">0</strong>
                <span>Total de tickets</span>
                <small>Todos los estados</small>
            </div>
        </div>

        <div class="history-kpi-card green">
            <div class="history-kpi-icon">✓</div>
            <div>
                <strong id="history-closed-count">0</strong>
                <span>Cerrados</span>
                <small>Casos finalizados</small>
            </div>
        </div>

        <div class="history-kpi-card orange">
            <div class="history-kpi-icon">◷</div>
            <div>
                <strong id="history-progress-count">0</strong>
                <span>En curso</span>
                <small>Casos en seguimiento</small>
            </div>
        </div>

        <div class="history-kpi-card purple">
            <div class="history-kpi-icon">⌛</div>
            <div>
                <strong id="history-pending-count">0</strong>
                <span>Pendientes</span>
                <small>Notas o casos pendientes</small>
            </div>
        </div>
    </div>

    <div class="history-filter-card">
        <form id="history-search-form" class="history-filter-form">

            <div class="history-filter-group search">
                <label for="history-search-text">Buscar</label>
                <input type="text" id="history-search-text" placeholder="Buscar por código, título o solicitante...">
            </div>

            <div class="history-filter-group">
                <label for="search-ticket-type">Tipo</label>
                <select id="search-ticket-type">
                    <option value="">Todos</option>
                    <option value="ti">TI</option>
                    <option value="velocity">Velocity</option>
                    <option value="siigo">Siigo</option>
                    <option value="nota">Nota</option>
                </select>
            </div>

            <div class="history-filter-group">
                <label for="search-status">Estado</label>
                <select id="search-status">
                    <option value="">Todos</option>
                    <option value="abierto">Abierto</option>
                    <option value="en-curso">En curso</option>
                    <option value="cerrado">Cerrado</option>
                    <option value="pendiente">Pendiente</option>
                    <option value="convertida">Convertida</option>
                </select>
            </div>

            <div class="history-filter-group">
                <label for="search-requester">Solicitante</label>
                <select id="search-requester">
                    <option value="">Todos</option>
                </select>
            </div>

            <div class="history-filter-group">
                <label for="search-start-date">Fecha desde</label>
                <input type="date" id="search-start-date">
            </div>

            <div class="history-filter-group">
                <label for="search-end-date">Fecha hasta</label>
                <input type="date" id="search-end-date">
            </div>

            <div class="history-filter-actions">
                <button type="submit" class="history-filter-btn">Filtrar</button>
                <button type="button" id="history-clear-btn" class="history-clear-btn">Limpiar</button>
            </div>

        </form>
    </div>

    <div class="history-timeline-card">
        <div class="history-timeline-header">
            <div>
                <h2>Línea de tiempo de actividad</h2>
                <p id="history-results-counter">Mostrando resultados</p>
            </div>

            <div class="history-sort-box">
                <label for="history-sort-select">Ordenar por:</label>
                <select id="history-sort-select">
                    <option value="desc">Más recientes</option>
                    <option value="asc">Más antiguos</option>
                </select>
            </div>
        </div>

        <div id="history-timeline-list" class="history-timeline-list"></div>

        <div class="history-load-more-wrap">
            <button type="button" id="history-load-more" class="history-load-more-btn">Cargar más</button>
        </div>
    </div>

    <table id="data-table" style="display:none;">
        <thead>
            <tr>
                <th># Ticket</th>
                <th>Título</th>
                <th>Tipo</th>
                <th>Solicitante</th>
                <th>Fecha Creación</th>
                <th>Fecha Cierre</th>
                <th>Estado</th>
                <th>Prioridad</th>
                <th>Acciones</th>
            </tr>
        </thead>
        <tbody></tbody>
    </table>

</section>
`;
    const knowledgeBaseHTML = `
<section class="kb-modern-page">

    <div class="kb-modern-header">
        <div class="kb-header-left">
            <div class="kb-main-icon">📘</div>
            <div>
                <h1>Base de conocimiento</h1>
                <p>Encuentra guías, manuales y artículos para resolver incidencias de forma rápida.</p>
            </div>
        </div>

        <div class="kb-header-actions">
            <button id="add-manual-btn" class="kb-action-btn primary">📘 Crear manual</button>
            <button id="add-kb-article-btn" class="kb-action-btn secondary">📄 Crear artículo</button>
        </div>
    </div>

    <div class="kb-search-box">
        <span>🔍</span>
        <input type="text" id="kb-search-input" placeholder="Buscar en artículos y manuales...">
        <small>Ctrl K</small>
    </div>

    <div class="kb-category-chips">
        <button type="button" class="kb-chip active" data-category="">▦ Todos</button>
        <button type="button" class="kb-chip" data-category="Redes">☍ Redes</button>
        <button type="button" class="kb-chip" data-category="Impresoras">▣ Impresoras</button>
        <button type="button" class="kb-chip" data-category="Velocity">Ⅴ Velocity</button>
        <button type="button" class="kb-chip" data-category="Siigo">$ Siigo</button>
        <button type="button" class="kb-chip" data-category="Dispositivos">▯ Dispositivos</button>
        <button type="button" class="kb-chip" data-category="Equipos">▭ Equipos</button>
        <button type="button" class="kb-chip" data-category="Cámaras">▣ Cámaras</button>
        <button type="button" class="kb-chip" data-category="Manual">📖 Manuales</button>
        <button type="button" class="kb-chip" data-category="Artículo">📄 Artículos</button>
    </div>

    <div id="kb-results-info" class="kb-results-info">
        Mostrando artículos
    </div>

    <div id="kb-grid-container" class="kb-modern-grid"></div>

    <div class="kb-pagination-info">
        <span id="kb-pagination-text">Mostrando resultados</span>
    </div>

</section>
`;
    const statisticsHTML = `
<section class="reports-modern-page">

    <div class="reports-modern-header">
        <div class="reports-title-wrap">
            <div class="reports-main-icon">📈</div>
            <div>
                <h1>Centro de análisis</h1>
                <p>Resumen ejecutivo y análisis de la actividad de soporte técnico.</p>
            </div>
        </div>

        <button id="export-report-pdf" class="reports-export-pdf">📄 Exportar PDF</button>
    </div>

    <div class="reports-filter-card">
        <div class="reports-filter-grid">
            <div class="reports-filter-group">
                <label for="stats-start-date">Fecha inicio</label>
                <input type="date" id="stats-start-date">
            </div>

            <div class="reports-filter-group">
                <label for="stats-end-date">Fecha fin</label>
                <input type="date" id="stats-end-date">
            </div>

            <div class="reports-filter-group">
                <label for="stats-ticket-type">Tipo de ticket</label>
                <select id="stats-ticket-type">
                    <option value="">Todos los tipos</option>
                    <option value="ti">Soporte TI</option>
                    <option value="velocity">Velocity</option>
                    <option value="siigo">Siigo</option>
                    <option value="nota">Nota rápida</option>
                </select>
            </div>

            <div class="reports-filter-group">
                <label for="stats-status">Estado</label>
                <select id="stats-status">
                    <option value="">Todos los estados</option>
                    <option value="cerrado">Cerrado</option>
                    <option value="en-curso">En curso</option>
                    <option value="pendiente">Pendiente</option>
                    <option value="convertida">Convertida</option>
                    <option value="abierto">Abierto</option>
                </select>
            </div>

            <button id="generate-stats-report" class="reports-generate-btn">Generar reporte</button>
        </div>
    </div>

    <div class="reports-kpi-grid">
        <div class="reports-kpi-card blue">
            <div class="reports-kpi-icon">🎫</div>
            <div>
                <strong id="reports-total-tickets">0</strong>
                <span>Total tickets</span>
                <small id="reports-total-percent">100% del periodo</small>
            </div>
        </div>

        <div class="reports-kpi-card green">
            <div class="reports-kpi-icon">✓</div>
            <div>
                <strong id="reports-closed-tickets">0</strong>
                <span>Cerrados</span>
                <small id="reports-closed-percent">0% del total</small>
            </div>
        </div>

        <div class="reports-kpi-card orange">
            <div class="reports-kpi-icon">◷</div>
            <div>
                <strong id="reports-progress-tickets">0</strong>
                <span>En curso</span>
                <small id="reports-progress-percent">0% del total</small>
            </div>
        </div>

        <div class="reports-kpi-card purple">
            <div class="reports-kpi-icon">⏱</div>
            <div>
                <strong id="reports-time-spent">0h 0m</strong>
                <span>Tiempo invertido</span>
                <small>Total del periodo</small>
            </div>
        </div>

        <div class="reports-kpi-card blue">
            <div class="reports-kpi-icon">📁</div>
            <div>
                <strong id="reports-top-category">N/A</strong>
                <span>Categoría principal</span>
                <small id="reports-top-category-count">0 tickets</small>
            </div>
        </div>

        <div class="reports-kpi-card blue">
            <div class="reports-kpi-icon">👤</div>
            <div>
                <strong id="reports-top-requester">N/A</strong>
                <span>Solicitante top</span>
                <small id="reports-top-requester-count">0 tickets</small>
            </div>
        </div>
    </div>

    <div class="reports-grid-main">

        <div class="reports-card">
            <div class="reports-card-header">
                <h3>Tickets por estado</h3>
            </div>
            <div class="reports-chart-box donut">
                <canvas id="reportStatusChart"></canvas>
            </div>
        </div>

        <div class="reports-card">
            <div class="reports-card-header">
                <h3>Tickets por tipo</h3>
            </div>
            <div class="reports-chart-box">
                <canvas id="reportTypeChart"></canvas>
            </div>
        </div>

        <div class="reports-card">
            <div class="reports-card-header">
                <h3>Creados vs cerrados</h3>
            </div>
            <div class="reports-chart-box">
                <canvas id="reportFlowChart"></canvas>
            </div>
        </div>

    </div>

    <div class="reports-grid-secondary">

        <div class="reports-card">
            <div class="reports-card-header">
                <h3>Tiempo invertido por categoría</h3>
                <span>Horas totales</span>
            </div>
            <div class="reports-chart-box">
                <canvas id="reportTimeByCategoryChart"></canvas>
            </div>
        </div>

        <div class="reports-card">
            <div class="reports-card-header">
                <h3>Top solicitantes</h3>
                <span>Por número de tickets</span>
            </div>
            <div id="reports-top-requesters-list" class="reports-ranking-list"></div>
        </div>

        <div class="reports-card">
            <div class="reports-card-header">
                <h3>Top dispositivos problemáticos</h3>
                <span>Más tickets registrados</span>
            </div>
            <div id="reports-top-devices-list" class="reports-ranking-list"></div>
        </div>

    </div>

    <div class="reports-section-title">Resumen de inventario</div>

    <div class="reports-inventory-grid">

        <div class="reports-card">
            <div class="reports-card-header">
                <h3>Dispositivos por categoría</h3>
                <span id="reports-total-devices">Total de dispositivos: 0</span>
            </div>
            <div class="reports-chart-box">
                <canvas id="reportInventoryCategoryChart"></canvas>
            </div>
        </div>

        <div class="reports-card">
            <div class="reports-card-header">
                <h3>Computadores por sistema operativo</h3>
                <span id="reports-total-computers">Total de computadores: 0</span>
            </div>
            <div class="reports-chart-box donut">
                <canvas id="reportOSChart"></canvas>
            </div>
        </div>

    </div>

</section>
`;
    const genericListPageHTML = `<h1 id="page-title"></h1><div class="add-new-button-container"><button class="export-btn csv" data-format="csv">Exportar a Excel (CSV)</button><button class="export-btn pdf" data-format="pdf">Exportar a PDF</button><button id="add-item-btn" class="btn-blue open-form-modal-btn">Añadir Nuevo</button></div><div class="card"><div class="table-search-container"><input type="text" id="table-search-input" placeholder="🔍 Buscar en la tabla..."></div><h2 id="item-list-title"></h2><div class="table-wrapper"><table id="data-table"><thead id="item-table-head"></thead><tbody id="item-table-body"></tbody></table></div></div>`;
    const maintenanceCalendarHTML = `<h1>📅 Planificación</h1><div class="add-new-button-container"><button class="export-btn csv" data-format="csv">Exportar a Excel (CSV)</button><button class="export-btn pdf" data-format="pdf">Exportar a PDF</button><button class="primary open-form-modal-btn" data-type="maintenance">Programar Tarea</button></div><div class="card"><div id="maintenance-calendar"></div><table id="data-table" style="display:none;"></table></div>`;
    const configHTML = `<h1>⚙️ Configuración</h1><div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;"><div class="card"><h2>Gestionar Solicitantes</h2><form id="add-requester-form" style="display:flex; gap:10px; margin-bottom: 20px;"><input type="text" id="requester-name" placeholder="Nombre del solicitante" required style="flex-grow:1;"><button type="submit" class="primary">Añadir</button></form><ul id="requesters-list" class="config-list"></ul></div><div class="card"><h2>Gestionar Ubicaciones</h2><form id="add-location-form" style="display:flex; gap:10px; margin-bottom: 20px;"><input type="text" id="location-name" placeholder="Nombre de la ubicación" required style="flex-grow:1;"><button type="submit" class="primary">Añadir</button></form><ul id="locations-list" class="config-list"></ul></div></div>`;

    // --- 4. CONFIGURACIONES DE TABLAS ---
    function capitalizar(str) { if (!str) return str; return str.charAt(0).toUpperCase() + str.slice(1); }
    function exportToCSV(tableId, filename) { const table = document.getElementById(tableId); if (!table) return; let data = []; const headers = Array.from(table.querySelectorAll('thead th')).map(header => header.innerText).slice(0, -1); const rows = table.querySelectorAll('tbody tr'); rows.forEach(row => { const rowData = Array.from(row.querySelectorAll('td')).map(cell => cell.innerText).slice(0, -1); data.push(rowData); }); const csv = Papa.unparse({ fields: headers, data }, { delimiter: ";" }); const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' }); const link = document.createElement("a"); if (link.download !== undefined) { const url = URL.createObjectURL(blob); link.setAttribute("href", url); link.setAttribute("download", `${filename}.csv`); link.style.visibility = 'hidden'; document.body.appendChild(link); link.click(); document.body.removeChild(link); } }
    function exportToPDF(tableId, filename) { const table = document.getElementById(tableId); if (!table) return; const doc = new jsPDF({ orientation: "landscape" }); const head = [Array.from(table.querySelectorAll('thead th')).map(header => header.innerText).slice(0, -1)]; const body = Array.from(table.querySelectorAll('tbody tr')).map(row => Array.from(row.querySelectorAll('td')).map(cell => cell.innerText).slice(0, -1)); doc.autoTable({ head: head, body: body, startY: 10, styles: { font: "Inter", fontSize: 8 }, headStyles: { fillColor: [41, 128, 186], textColor: 255, fontStyle: 'bold' } }); doc.save(`${filename}.pdf`); }
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
        atencion: { title: 'Usuarios App Atención al Cliente', titleSingular: 'Usuario App Atención al Cliente', prefix: 'CRED-APPAT-', counter: 'atencionCounter', fields: { id: { label: 'Código' }, username: { label: 'Usuario', type: 'text' }, password: { label: 'Contraseña', type: 'text' }, assignedUser: { label: 'Usuario asignado', type: 'text' }, status: { label: 'Estado', type: 'select', options: ['Activo', 'Inactivo'] }, notes: { label: 'Notas', type: 'textarea' } } },
        others: { title: 'Otras Credenciales', titleSingular: 'Credencial', prefix: 'CRED-OTH-', counter: 'otherCredentialCounter', fields: { id: { label: 'Código' }, system: { label: 'Sistema/Servicio', type: 'text' }, url: { label: 'URL (Opcional)', type: 'text' }, username: { label: 'Usuario', type: 'text' }, password: { label: 'Contraseña', type: 'text' }, notes: { label: 'Notas', type: 'textarea' } } }
    };

    // --- 5. FUNCIONES DE RENDERIZADO ---
    function handleFirestoreError(error, element) { element.innerHTML = `<div class="card" style="padding: 20px; border-left: 5px solid red;">Error al cargar datos: ${error.message}</div>`; }
    async function renderDashboard(container) {
    container.innerHTML = dashboardHTML;

    const dateFilter = document.getElementById('dashboard-date-filter');
    const requesterFilter = document.getElementById('dashboard-requester-filter');
    const rangeFilter = document.getElementById('dashboard-range-filter');

    const now = new Date();
    const localNow = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
    dateFilter.value = localNow.toISOString().split('T')[0];

    function formatMinutes(totalMinutes) {
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        return `${hours}h ${minutes}m`;
    }

    function getTicketDate(ticket) {
        if (ticket.createdAt && ticket.createdAt.toDate) return ticket.createdAt.toDate();
        if (ticket.registeredAt && ticket.registeredAt.toDate) return ticket.registeredAt.toDate();
        return null;
    }

    function getMonthRange(baseDate) {
        const start = new Date(baseDate.getFullYear(), baseDate.getMonth(), 1);
        const end = new Date(baseDate.getFullYear(), baseDate.getMonth() + 1, 0, 23, 59, 59, 999);
        return { start, end };
    }

    function sameRange(date, start, end) {
        return date && date >= start && date <= end;
    }

    function getStatusLabel(status) {
        const labels = {
            'cerrado': 'Cerrado',
            'en-curso': 'En seguimiento',
            'abierto': 'Abierto',
            'pendiente': 'Pendiente',
            'convertida': 'Convertida'
        };

        return labels[status] || capitalizar(status || 'Sin estado');
    }

    function getTypeLabel(type) {
        const labels = {
            ti: 'Soporte TI',
            velocity: 'Velocity',
            siigo: 'Siigo',
            nota: 'Nota rápida'
        };

        return labels[type] || capitalizar(type || 'Soporte');
    }

    async function loadDashboardData() {
        try {
            const selectedDate = dateFilter.value ? new Date(dateFilter.value + 'T12:00:00') : new Date();
            const { start, end } = getMonthRange(selectedDate);

            const [ticketsSnapshot, requestersSnapshot] = await Promise.all([
                db.collection('tickets').get(),
                db.collection('requesters').orderBy('name').get()
            ]);

            const requestersMap = {};
            requesterFilter.innerHTML = '<option value="">Todos los solicitantes</option>';

            requestersSnapshot.forEach(doc => {
                requestersMap[doc.id] = doc.data().name;
                requesterFilter.innerHTML += `<option value="${doc.id}">${doc.data().name}</option>`;
            });

            const selectedRequester = requesterFilter.dataset.selected || '';

            if (selectedRequester) {
                requesterFilter.value = selectedRequester;
            }

            let tickets = ticketsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            if (requesterFilter.value) {
                tickets = tickets.filter(t => t.requesterId === requesterFilter.value);
            }

            const monthTickets = tickets.filter(ticket => {
                const ticketDate = getTicketDate(ticket);
                return sameRange(ticketDate, start, end);
            });

            const closedMonthTickets = monthTickets.filter(t => t.status === 'cerrado');
            const followupMonthTickets = monthTickets.filter(t =>
                t.status === 'en-curso' ||
                t.status === 'pendiente' ||
                t.ticketType === 'velocity' ||
                t.ticketType === 'siigo'
            );

            const totalMinutes = monthTickets.reduce((sum, ticket) => {
                return sum + (Number(ticket.timeSpentMinutes) || 0);
            }, 0);

            const totalMonth = monthTickets.length;
            const closedMonth = closedMonthTickets.length;
            const followupMonth = followupMonthTickets.length;
            const formattedTime = formatMinutes(totalMinutes);

            document.getElementById('dash-total-month').textContent = totalMonth;
            document.getElementById('dash-time-month').textContent = formattedTime;
            document.getElementById('dash-closed-month').textContent = closedMonth;
            document.getElementById('dash-followup-month').textContent = followupMonth;

            document.getElementById('kpi-total-month').textContent = totalMonth;
            document.getElementById('kpi-time-month').textContent = formattedTime;
            document.getElementById('kpi-closed-month').textContent = closedMonth;
            document.getElementById('kpi-followup-month').textContent = followupMonth;

            document.getElementById('dashboard-month-label').textContent = selectedDate.toLocaleDateString('es-ES', {
                month: 'long',
                year: 'numeric'
            });

            renderTrendChart(tickets);
            renderMonthlyHeatmap(monthTickets, selectedDate);
            renderTopRequesters(monthTickets, requestersMap);
            renderCategoryChart(monthTickets);
            renderRecentActivity(tickets, requestersMap);

        } catch (error) {
            console.error('Error cargando dashboard:', error);
            container.innerHTML = '<div class="card"><h2>Error cargando dashboard</h2><p>Revisa la consola para más detalles.</p></div>';
        }
    }

    function renderTrendChart(tickets) {
        const days = Number(rangeFilter.value || 7);
        const labels = [];
        const createdData = [];
        const closedData = [];

        for (let i = days - 1; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            d.setHours(0, 0, 0, 0);

            const next = new Date(d);
            next.setDate(next.getDate() + 1);

            labels.push(d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }));

            const createdCount = tickets.filter(ticket => {
                const ticketDate = getTicketDate(ticket);
                return ticketDate && ticketDate >= d && ticketDate < next;
            }).length;

            const closedCount = tickets.filter(ticket => {
                if (!ticket.closedAt || !ticket.closedAt.toDate) return false;
                const closedDate = ticket.closedAt.toDate();
                return closedDate >= d && closedDate < next;
            }).length;

            createdData.push(createdCount);
            closedData.push(closedCount);
        }

        const ctx = document.getElementById('supportTrendChart').getContext('2d');

        if (window.supportTrendChartInstance) {
            window.supportTrendChartInstance.destroy();
        }

        window.supportTrendChartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels,
                datasets: [
                    {
                        label: 'Creados',
                        data: createdData,
                        borderColor: '#2563eb',
                        backgroundColor: 'rgba(37, 99, 235, 0.10)',
                        fill: true,
                        tension: 0.35,
                        pointRadius: 4
                    },
                    {
                        label: 'Cerrados',
                        data: closedData,
                        borderColor: '#10b981',
                        backgroundColor: 'rgba(16, 185, 129, 0.10)',
                        fill: true,
                        tension: 0.35,
                        pointRadius: 4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                        align: 'start'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            precision: 0
                        }
                    }
                }
            }
        });
    }

    function renderMonthlyHeatmap(monthTickets, selectedDate) {
        const grid = document.getElementById('monthly-activity-grid');
        const year = selectedDate.getFullYear();
        const month = selectedDate.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        const dayCounts = {};

        monthTickets.forEach(ticket => {
            const ticketDate = getTicketDate(ticket);
            if (!ticketDate) return;

            const day = ticketDate.getDate();
            dayCounts[day] = (dayCounts[day] || 0) + 1;
        });

        const weekDays = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

        let html = weekDays.map(day => `<div class="pb-month-day-name">${day}</div>`).join('');

        const firstDay = new Date(year, month, 1).getDay();
        const emptyBefore = firstDay === 0 ? 6 : firstDay - 1;

        for (let i = 0; i < emptyBefore; i++) {
            html += `<div class="pb-month-cell empty"></div>`;
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const count = dayCounts[day] || 0;

            let level = 0;
            if (count >= 1 && count <= 5) level = 1;
            if (count >= 6 && count <= 10) level = 2;
            if (count >= 11 && count <= 20) level = 3;
            if (count > 20) level = 4;

            html += `
                <div class="pb-month-cell level-${level}">
                    <strong>${day}</strong>
                    <span>${count}</span>
                </div>
            `;
        }

        grid.innerHTML = html;
    }

    function renderTopRequesters(monthTickets, requestersMap) {
        const container = document.getElementById('top-requesters-dashboard');

        const counts = {};

        monthTickets.forEach(ticket => {
            if (!ticket.requesterId) return;
            counts[ticket.requesterId] = (counts[ticket.requesterId] || 0) + 1;
        });

        const top = Object.entries(counts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);

        if (top.length === 0) {
            container.innerHTML = '<p class="pb-empty">Aún no hay solicitantes en este periodo.</p>';
            return;
        }

        const max = Math.max(...top.map(item => item[1]));

        container.innerHTML = top.map(([id, count]) => {
            const percent = Math.round((count / max) * 100);

            return `
                <div class="pb-requester-row">
                    <span>${requestersMap[id] || id}</span>
                    <strong>${count}</strong>
                    <div class="pb-mini-bar">
                        <i style="width:${percent}%"></i>
                    </div>
                </div>
            `;
        }).join('');
    }

    function renderCategoryChart(monthTickets) {
        const listContainer = document.getElementById('category-dashboard-list');
        const counts = {};

        monthTickets.forEach(ticket => {
            const type = ticket.ticketType || ticket.supportType || 'otro';
            counts[type] = (counts[type] || 0) + 1;
        });

        const labelsMap = {
            ti: 'Soporte TI',
            velocity: 'Velocity',
            siigo: 'Siigo',
            nota: 'Nota rápida',
            otro: 'Otro'
        };

        const labels = Object.keys(counts).map(key => labelsMap[key] || capitalizar(key));
        const values = Object.values(counts);

        if (window.categoryDashboardChartInstance) {
            window.categoryDashboardChartInstance.destroy();
        }

        const ctx = document.getElementById('categoryDashboardChart').getContext('2d');

        window.categoryDashboardChartInstance = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels,
                datasets: [{
                    data: values,
                    backgroundColor: ['#2563eb', '#f97316', '#14b8a6', '#8b5cf6', '#ef4444'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '65%',
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });

        const total = values.reduce((a, b) => a + b, 0);

        listContainer.innerHTML = Object.entries(counts).map(([key, value], index) => {
            const percent = total ? Math.round((value / total) * 100) : 0;
            const colors = ['#2563eb', '#f97316', '#14b8a6', '#8b5cf6', '#ef4444'];

            return `
                <div class="pb-category-row">
                    <span><i style="background:${colors[index % colors.length]}"></i>${labelsMap[key] || capitalizar(key)}</span>
                    <strong>${value} (${percent}%)</strong>
                </div>
            `;
        }).join('') || '<p class="pb-empty">No hay datos.</p>';
    }

    function renderRecentActivity(tickets, requestersMap) {
        const container = document.getElementById('recent-activity-dashboard');

        const recent = [...tickets]
            .filter(ticket => getTicketDate(ticket))
            .sort((a, b) => getTicketDate(b) - getTicketDate(a))
            .slice(0, 5);

        if (recent.length === 0) {
            container.innerHTML = '<p class="pb-empty">Aún no hay actividad reciente.</p>';
            return;
        }

        container.innerHTML = recent.map(ticket => {
            const ticketDate = getTicketDate(ticket);
            const requester = requestersMap[ticket.requesterId] || 'Sin solicitante';

            return `
                <div class="pb-activity-row">
                    <div class="pb-activity-icon ${ticket.status || 'abierto'}">•</div>
                    <div>
                        <strong>${ticket.id} - ${ticket.title || getTypeLabel(ticket.ticketType)}</strong>
                        <span>${requester} · ${getTypeLabel(ticket.ticketType)}</span>
                    </div>
                    <div class="pb-activity-meta">
                        <small>${ticketDate.toLocaleDateString('es-ES')}</small>
                        <em class="status status-${ticket.status || 'abierto'}">${getStatusLabel(ticket.status)}</em>
                    </div>
                </div>
            `;
        }).join('');
    }

    requesterFilter.addEventListener('change', () => {
        requesterFilter.dataset.selected = requesterFilter.value;
        loadDashboardData();
    });

    dateFilter.addEventListener('change', loadDashboardData);
    rangeFilter.addEventListener('change', loadDashboardData);

    loadDashboardData();
}
   
    async function renderNewTITicketForm(container) {
    container.innerHTML = newTITicketFormHTML;

    const dateInput = document.getElementById('support-date');
    const timeInput = document.getElementById('support-time');
    const requesterSelect = document.getElementById('requester');
    const locationSelect = document.getElementById('location');
    const deviceDatalist = document.getElementById('device-list');
    const categorySelect = document.getElementById('category');
    const noveltyInput = document.getElementById('novelty');

    const now = new Date();
    const localNow = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
    dateInput.value = localNow.toISOString().split('T')[0];
    timeInput.value = localNow.toISOString().slice(11, 16);

    try {
        const [reqSnap, locSnap, invSnap] = await Promise.all([
            db.collection('requesters').orderBy('name').get(),
            db.collection('locations').orderBy('name').get(),
            db.collection('inventory').get()
        ]);

        requesterSelect.innerHTML = '<option value="">Selecciona un solicitante</option>';
        reqSnap.forEach(doc => {
            requesterSelect.innerHTML += `<option value="${doc.id}">${doc.data().name}</option>`;
        });

        locationSelect.innerHTML = '<option value="">Selecciona una sede</option>';
        locSnap.forEach(doc => {
            locationSelect.innerHTML += `<option value="${doc.id}">${doc.data().name}</option>`;
        });

        const devices = invSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        deviceDatalist.innerHTML = devices.map(d => {
            const userText = d.user ? ` - Usuario: ${d.user}` : '';
            const brandText = `${d.brand || ''} ${d.model || ''}`.trim();
            return `<option value="${d.id}">${brandText}${userText}</option>`;
        }).join('');

    } catch (error) {
        console.error('Error cargando datos iniciales:', error);
        alert('No se pudieron cargar solicitantes, sedes o inventario.');
    }
document.querySelectorAll('.quick-chip').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.quick-chip').forEach(chip => {
            chip.classList.remove('active');
        });

        btn.classList.add('active');

        categorySelect.value = btn.dataset.category || '';

        if (btn.dataset.text) {
            noveltyInput.value = btn.dataset.text;
        }
    });
});
async function loadSupportSummary() {
    try {
        const now = new Date();

        const startOfToday = new Date(now);
        startOfToday.setHours(0, 0, 0, 0);

        const startOfWeek = new Date(now);
        const day = startOfWeek.getDay();
        const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
        startOfWeek.setDate(diff);
        startOfWeek.setHours(0, 0, 0, 0);

        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const todaySnap = await db.collection('tickets')
            .where('recordType', '==', 'soporte_realizado')
            .where('registeredAt', '>=', startOfToday)
            .get();

        const weekSnap = await db.collection('tickets')
            .where('recordType', '==', 'soporte_realizado')
            .where('registeredAt', '>=', startOfWeek)
            .get();

        const monthSnap = await db.collection('tickets')
            .where('recordType', '==', 'soporte_realizado')
            .where('registeredAt', '>=', startOfMonth)
            .get();

        document.getElementById('today-supports').textContent = todaySnap.size;
        document.getElementById('week-supports').textContent = weekSnap.size;
        document.getElementById('month-supports').textContent = monthSnap.size;

    } catch (error) {
        console.error('Error cargando resumen de soportes:', error);
    }
}

loadSupportSummary();
        
    const form = document.getElementById('new-ticket-form');
const quickNoteRaw = sessionStorage.getItem('quickNoteToConvert');

if (quickNoteRaw) {
    const quickNote = JSON.parse(quickNoteRaw);

    if (quickNote.supportType === 'ti') {
        document.getElementById('novelty').value = quickNote.text || '';

        if (quickNote.requesterId) {
            document.getElementById('requester').value = quickNote.requesterId;
        }
    }
}
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const counterRef = db.collection('counters').doc('ticketCounter');

        try {
            const newTicketId = await db.runTransaction(async (transaction) => {
                const counterDoc = await transaction.get(counterRef);

                if (!counterDoc.exists) {
                    throw new Error('El documento contador de tickets no existe.');
                }

                const newNumber = counterDoc.data().currentNumber + 1;
                transaction.update(counterRef, { currentNumber: newNumber });

                return `TICKET-${newNumber}`;
            });

            const fecha = form['support-date'].value;
            const hora = form['support-time'].value;
            const supportDate = new Date(`${fecha}T${hora}`);
            const supportTimestamp = firebase.firestore.Timestamp.fromDate(supportDate);

            const ticketNumber = parseInt(newTicketId.split('-')[1], 10);

            const deviceValue = form['associated-device'].value.trim();
            const deviceIds = deviceValue ? [deviceValue] : [];

            const categoryText = form.category.options[form.category.selectedIndex].text;
            const novelty = form.novelty.value.trim();
            const management = form.management.value.trim();
            const solution = form.solution.value.trim();

            const newSupportData = {
                numericId: ticketNumber,

                // Compatibilidad con tu sistema actual
                ticketType: 'ti',
                title: categoryText,
                description: novelty,
                priority: 'media',
                status: 'cerrado',
                solution: solution,
                requesterId: form.requester.value,
                locationId: form.location.value,
                deviceIds: deviceIds,
                createdAt: supportTimestamp,
                closedAt: supportTimestamp,
                history: [
                    {
                        text: '<strong>Soporte registrado como realizado.</strong><br>El soporte fue creado y cerrado automáticamente desde Registro rápido.',
                        timestamp: firebase.firestore.Timestamp.fromDate(new Date())
                    }
                ],

                // Nuevos campos para la bitácora
                recordType: 'soporte_realizado',
                supportType: 'ti',
                category: form.category.value,
                novelty: novelty,
                management: management,
                timeSpentMinutes: Number(form['time-spent'].value),
                responsibleName: 'Jahan Michelle Chara',
                registeredAt: firebase.firestore.FieldValue.serverTimestamp(),
                isBacklogEntry: false,
                autoClosed: true,
                externalProvider: null,
                externalCaseNumber: null,
                externalAdvisor: null,
                externalStatus: null
            };

            await db.collection('tickets').doc(newTicketId).set(newSupportData);
            const quickNoteRawAfterSave = sessionStorage.getItem('quickNoteToConvert');

if (quickNoteRawAfterSave) {
    const quickNote = JSON.parse(quickNoteRawAfterSave);

    if (quickNote.supportType === 'ti') {
        await db.collection('tickets').doc(quickNote.noteId).update({
            status: 'convertida',
            convertedToSupport: true,
            convertedTicketId: newTicketId,
            convertedAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        sessionStorage.removeItem('quickNoteToConvert');
    }
}
            alert(`¡Soporte ${newTicketId} registrado y cerrado con éxito!`);
            window.location.hash = '#tickets';

        } catch (error) {
            console.error('Error al registrar soporte:', error);
            alert('No se pudo registrar el soporte.');
        }
    });
}
    
   async function renderNewPlatformTicketForm(container, platform) {
    container.innerHTML = newPlatformTicketFormHTML;

    document.getElementById('page-title').innerText = `Registrar caso ${platform}`;
    document.getElementById('page-subtitle').innerText = `Guarda lo que gestionaste y deja el caso en seguimiento.`;
    document.getElementById('platform-summary-title').innerText = `${platform} en seguimiento`;

    if (platform === 'Velocity') {
        document.getElementById('card-velocity').classList.add('active');
    }

    if (platform === 'Siigo') {
        document.getElementById('card-siigo').classList.add('active');
    }

    const solicitanteSelect = document.getElementById('solicitante');
    const locationSelect = document.getElementById('location');
    const medioSolicitudSelect = document.getElementById('medio-solicitud');

    try {
        const [reqSnap, locSnap] = await Promise.all([
            db.collection('requesters').orderBy('name').get(),
            db.collection('locations').orderBy('name').get()
        ]);

        solicitanteSelect.innerHTML = '<option value="">Selecciona un solicitante</option>';
        reqSnap.forEach(doc => {
            solicitanteSelect.innerHTML += `<option value="${doc.id}">${doc.data().name}</option>`;
        });

        locationSelect.innerHTML = '<option value="">Selecciona una sede</option>';
        locSnap.forEach(doc => {
            locationSelect.innerHTML += `<option value="${doc.id}">${doc.data().name}</option>`;
        });

    } catch (error) {
        console.error("Error cargando datos:", error);
        alert("No se pudieron cargar solicitantes o sedes.");
    }

    if (platform === 'Velocity') {
        medioSolicitudSelect.innerHTML = `
            <option value="">Selecciona un medio</option>
            <option value="WhatsApp">WhatsApp</option>
            <option value="Centro de ayuda JIRA">Centro de ayuda JIRA</option>
            <option value="Llamada">Llamada</option>
            <option value="Correo">Correo</option>
            <option value="Otro">Otro</option>
        `;
    }

    if (platform === 'Siigo') {
        medioSolicitudSelect.innerHTML = `
            <option value="">Selecciona un medio</option>
            <option value="WhatsApp">WhatsApp</option>
            <option value="Línea de atención Telefónica">Línea de atención Telefónica</option>
            <option value="Chat de soporte">Chat de soporte</option>
            <option value="Correo">Correo</option>
            <option value="Otro">Otro</option>
        `;
    }

    const now = new Date();
    const localNow = new Date(now.getTime() - now.getTimezoneOffset() * 60000);

    document.getElementById('fecha-reporte').value = localNow.toISOString().split('T')[0];
    document.getElementById('hora-reporte').value = localNow.toISOString().slice(11, 16);

    const form = document.getElementById('new-platform-ticket-form');
       const quickNoteRaw = sessionStorage.getItem('quickNoteToConvert');

if (quickNoteRaw) {
    const quickNote = JSON.parse(quickNoteRaw);

    if (
        (platform === 'Velocity' && quickNote.supportType === 'velocity') ||
        (platform === 'Siigo' && quickNote.supportType === 'siigo')
    ) {
        document.getElementById('descripcion-novedad').value = quickNote.text || '';

        if (quickNote.requesterId) {
            document.getElementById('solicitante').value = quickNote.requesterId;
        }
    }
}

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const counterRef = db.collection('counters').doc('ticketCounter');

        try {
            const newTicketId = await db.runTransaction(async (transaction) => {
                const counterDoc = await transaction.get(counterRef);

                if (!counterDoc.exists) {
                    throw new Error("El contador de tickets no existe.");
                }

                const newNumber = counterDoc.data().currentNumber + 1;
                transaction.update(counterRef, { currentNumber: newNumber });

                return `TICKET-${newNumber}`;
            });

            const fecha = document.getElementById('fecha-reporte').value;
            const hora = document.getElementById('hora-reporte').value;
            const createdAtTimestamp = firebase.firestore.Timestamp.fromDate(new Date(`${fecha}T${hora}`));

            const ticketNumber = parseInt(newTicketId.split('-')[1], 10);
            const estadoProveedor = document.getElementById('estado-proveedor').value;
            const categorySelect = document.getElementById('category');
            const categoryText = categorySelect.options[categorySelect.selectedIndex].text;

            const novelty = document.getElementById('descripcion-novedad').value.trim();
            const management = document.getElementById('gestion-realizada').value.trim();
            const providerResponse = document.getElementById('respuesta-proveedor').value.trim();
            const providerResponseText = providerResponse 
                ? `<br>Respuesta: ${providerResponse}` 
                : `<br>Respuesta: pendiente por proveedor.`;

            const newTicketData = {
                numericId: ticketNumber,

                ticketType: platform.toLowerCase(),
                title: `${platform} - ${categoryText}`,
                descripcionDeLaNovedad: novelty,
                description: novelty,
                requesterId: document.getElementById('solicitante').value,
                locationId: document.getElementById('location').value,
                medioDeSolicitud: document.getElementById('medio-solicitud').value,
                asesorDeSoporte: document.getElementById('asesor-soporte').value.trim(),
                ticketDelCaso: document.getElementById('ticket-caso').value.trim(),

                status: 'en-curso',
                solution: providerResponse || null,
                createdAt: createdAtTimestamp,
                closedAt: null,

                history: [
                    {
                        text: `<strong>Caso ${platform} registrado.</strong><br>Estado: ${estadoProveedor}. Queda en seguimiento.${providerResponseText}`,
                        timestamp: firebase.firestore.Timestamp.fromDate(new Date())
                    }
                ],

                recordType: 'soporte_realizado',
                supportType: platform.toLowerCase(),
                category: categorySelect.value,
                novelty: novelty,
                management: management,
                timeSpentMinutes: Number(document.getElementById('time-spent').value),
                responsibleName: 'Jahan Michelle Chara',
                registeredAt: firebase.firestore.FieldValue.serverTimestamp(),
                isBacklogEntry: false,
                autoClosed: false,

                externalProvider: platform,
                externalCaseNumber: document.getElementById('ticket-caso').value.trim(),
                externalAdvisor: document.getElementById('asesor-soporte').value.trim(),
                externalStatus: estadoProveedor,
                providerResponse: providerResponse || null
            };

            await db.collection('tickets').doc(newTicketId).set(newTicketData);
            const quickNoteRawAfterSave = sessionStorage.getItem('quickNoteToConvert');

if (quickNoteRawAfterSave) {
    const quickNote = JSON.parse(quickNoteRawAfterSave);

    if (
        (platform === 'Velocity' && quickNote.supportType === 'velocity') ||
        (platform === 'Siigo' && quickNote.supportType === 'siigo')
    ) {
        await db.collection('tickets').doc(quickNote.noteId).update({
            status: 'convertida',
            convertedToSupport: true,
            convertedTicketId: newTicketId,
            convertedAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        sessionStorage.removeItem('quickNoteToConvert');
    }
}
            alert(`¡Caso ${platform} registrado y dejado en seguimiento!`);
            window.location.hash = '#tickets';

        } catch (error) {
            console.error(`Error al registrar caso ${platform}:`, error);
            alert(`No se pudo registrar el caso ${platform}.`);
        }
    });
}
    async function renderQuickNote(container) {
    container.innerHTML = quickNoteHTML;

    const dateInput = document.getElementById('note-date');
    const timeInput = document.getElementById('note-time');
    const requesterSelect = document.getElementById('note-requester');

    const now = new Date();
    const localNow = new Date(now.getTime() - now.getTimezoneOffset() * 60000);

    dateInput.value = localNow.toISOString().split('T')[0];
    timeInput.value = localNow.toISOString().slice(11, 16);

    try {
        const reqSnap = await db.collection('requesters').orderBy('name').get();

        requesterSelect.innerHTML = '<option value="">Selecciona un solicitante</option>';
        reqSnap.forEach(doc => {
            requesterSelect.innerHTML += `<option value="${doc.id}">${doc.data().name}</option>`;
        });

    } catch (error) {
        console.error('Error cargando solicitantes:', error);
    }

    const form = document.getElementById('quick-note-form');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const counterRef = db.collection('counters').doc('ticketCounter');

        try {
            const newTicketId = await db.runTransaction(async (transaction) => {
                const counterDoc = await transaction.get(counterRef);

                if (!counterDoc.exists) {
                    throw new Error('El contador de tickets no existe.');
                }

                const newNumber = counterDoc.data().currentNumber + 1;
                transaction.update(counterRef, { currentNumber: newNumber });

                return `TICKET-${newNumber}`;
            });

            const fecha = document.getElementById('note-date').value;
            const hora = document.getElementById('note-time').value;
            const noteType = document.getElementById('note-type').value;
            const noteText = document.getElementById('note-text').value.trim();
            const requesterId = document.getElementById('note-requester').value;

            const noteTimestamp = firebase.firestore.Timestamp.fromDate(new Date(`${fecha}T${hora}`));
            const ticketNumber = parseInt(newTicketId.split('-')[1], 10);

            const typeLabel = {
                ti: 'Soporte TI',
                velocity: 'Velocity',
                siigo: 'Siigo',
                otro: 'Otro'
            }[noteType];

            const quickNoteData = {
                numericId: ticketNumber,
                ticketType: 'nota',
                recordType: 'nota_rapida',
                supportType: noteType,

                title: `Nota rápida - ${typeLabel}`,
                description: noteText,
                descripcionDeLaNovedad: noteText,

                requesterId: requesterId || null,
                locationId: null,
                priority: 'media',
                status: 'pendiente',

                solution: null,
                createdAt: noteTimestamp,
                closedAt: null,
                registeredAt: firebase.firestore.FieldValue.serverTimestamp(),

                isQuickNote: true,
                convertedToSupport: false,
                responsibleName: 'Jahan Michelle Chara',

                history: [
                    {
                        text: `<strong>Nota rápida registrada.</strong><br>${noteText}`,
                        timestamp: firebase.firestore.Timestamp.fromDate(new Date())
                    }
                ]
            };

            await db.collection('tickets').doc(newTicketId).set(quickNoteData);

            alert(`¡Nota rápida ${newTicketId} guardada!`);
            window.location.hash = '#tickets';

        } catch (error) {
            console.error('Error guardando nota rápida:', error);
            alert('No se pudo guardar la nota rápida.');
        }
    });
}
    async function renderBacklogSupports(container) {
    container.innerHTML = backlogSupportsHTML;

    const tableBody = document.getElementById('backlog-table-body');
    const addRowBtn = document.getElementById('add-backlog-row');
    const saveBtn = document.getElementById('save-backlog-supports');

    let requesterOptions = '<option value="">Solicitante</option>';
    let locationOptions = '<option value="">Sede</option>';

    try {
        const [reqSnap, locSnap] = await Promise.all([
            db.collection('requesters').orderBy('name').get(),
            db.collection('locations').orderBy('name').get()
        ]);

        reqSnap.forEach(doc => {
            requesterOptions += `<option value="${doc.id}">${doc.data().name}</option>`;
        });

        locSnap.forEach(doc => {
            locationOptions += `<option value="${doc.id}">${doc.data().name}</option>`;
        });

    } catch (error) {
        console.error('Error cargando datos:', error);
        alert('No se pudieron cargar solicitantes o sedes.');
    }

    function getTodayDate() {
        const now = new Date();
        const localNow = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
        return localNow.toISOString().split('T')[0];
    }

    function getCurrentTime() {
        const now = new Date();
        const localNow = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
        return localNow.toISOString().slice(11, 16);
    }

    function createBacklogRow() {
        const tr = document.createElement('tr');
        tr.className = 'backlog-row';

        tr.innerHTML = `
            <td><input type="date" class="backlog-date" value="${getTodayDate()}" required></td>
            <td><input type="time" class="backlog-time" value="${getCurrentTime()}" required></td>

            <td>
                <select class="backlog-type" required>
                    <option value="ti">TI</option>
                    <option value="velocity">Velocity</option>
                    <option value="siigo">Siigo</option>
                </select>
            </td>

            <td>
                <select class="backlog-requester" required>
                    ${requesterOptions}
                </select>
            </td>

            <td>
                <select class="backlog-location" required>
                    ${locationOptions}
                </select>
            </td>

            <td>
                <select class="backlog-category" required>
                    <option value="">Categoría</option>
                    <option value="impresora">Impresora</option>
                    <option value="equipo-lento">Equipo lento</option>
                    <option value="internet">Internet</option>
                    <option value="correo">Correo</option>
                    <option value="camara">Cámara</option>
                    <option value="instalacion">Instalación</option>
                    <option value="facturacion">Facturación</option>
                    <option value="inventario">Inventario</option>
                    <option value="usuarios">Usuarios / accesos</option>
                    <option value="error-sistema">Error del sistema</option>
                    <option value="otro">Otro</option>
                </select>
            </td>

            <td><textarea class="backlog-novelty" rows="2" placeholder="Qué pasó..." required></textarea></td>
            <td><textarea class="backlog-management" rows="2" placeholder="Qué hiciste..." required></textarea></td>
            <td><textarea class="backlog-solution" rows="2" placeholder="Solución o respuesta..."></textarea></td>

            <td>
                <select class="backlog-time-spent" required>
                    <option value="">Tiempo</option>
                    <option value="5">5 min</option>
                    <option value="10">10 min</option>
                    <option value="15">15 min</option>
                    <option value="20">20 min</option>
                    <option value="30">30 min</option>
                    <option value="45">45 min</option>
                    <option value="60">1 h</option>
                    <option value="90">1 h 30 min</option>
                    <option value="120">2 h</option>
                </select>
            </td>

            <td>
                <select class="backlog-status" required>
                    <option value="auto">Automático</option>
                    <option value="cerrado">Cerrado</option>
                    <option value="en-curso">En curso</option>
                </select>
            </td>

            <td>
                <button type="button" class="remove-backlog-row">×</button>
            </td>
        `;

        tableBody.appendChild(tr);

        tr.querySelector('.remove-backlog-row').addEventListener('click', () => {
            if (tableBody.querySelectorAll('.backlog-row').length > 1) {
                tr.remove();
            }
        });
    }

    createBacklogRow();

    addRowBtn.addEventListener('click', createBacklogRow);

    saveBtn.addEventListener('click', async () => {
        const rows = Array.from(document.querySelectorAll('.backlog-row'));

        if (rows.length === 0) {
            alert('Agrega al menos una fila.');
            return;
        }

        saveBtn.disabled = true;
        saveBtn.textContent = 'Guardando...';

        try {
            for (const row of rows) {
                const type = row.querySelector('.backlog-type').value;
                const fecha = row.querySelector('.backlog-date').value;
                const hora = row.querySelector('.backlog-time').value;
                const requesterId = row.querySelector('.backlog-requester').value;
                const locationId = row.querySelector('.backlog-location').value;
                const category = row.querySelector('.backlog-category').value;
                const categoryText = row.querySelector('.backlog-category').options[row.querySelector('.backlog-category').selectedIndex].text;
                const novelty = row.querySelector('.backlog-novelty').value.trim();
                const management = row.querySelector('.backlog-management').value.trim();
                const solution = row.querySelector('.backlog-solution').value.trim();
                const timeSpent = Number(row.querySelector('.backlog-time-spent').value);
                const selectedStatus = row.querySelector('.backlog-status').value;

                if (!fecha || !hora || !type || !requesterId || !locationId || !category || !novelty || !management || !timeSpent) {
                    alert('Completa todos los campos obligatorios antes de guardar.');
                    saveBtn.disabled = false;
                    saveBtn.textContent = 'Guardar todos';
                    return;
                }

                const supportTimestamp = firebase.firestore.Timestamp.fromDate(new Date(`${fecha}T${hora}`));

                let finalStatus = selectedStatus;

                if (selectedStatus === 'auto') {
                    finalStatus = type === 'ti' ? 'cerrado' : 'en-curso';
                }

                const counterRef = db.collection('counters').doc('ticketCounter');

                const newTicketId = await db.runTransaction(async (transaction) => {
                    const counterDoc = await transaction.get(counterRef);

                    if (!counterDoc.exists) {
                        throw new Error('El contador de tickets no existe.');
                    }

                    const newNumber = counterDoc.data().currentNumber + 1;
                    transaction.update(counterRef, { currentNumber: newNumber });

                    return `TICKET-${newNumber}`;
                });

                const ticketNumber = parseInt(newTicketId.split('-')[1], 10);

                const isProvider = type === 'velocity' || type === 'siigo';
                const platformName = type === 'velocity' ? 'Velocity' : type === 'siigo' ? 'Siigo' : null;

                const backlogData = {
                    numericId: ticketNumber,
                    ticketType: type,
                    recordType: 'soporte_realizado',
                    supportType: type,

                    title: isProvider ? `${platformName} - ${categoryText}` : categoryText,
                    description: novelty,
                    descripcionDeLaNovedad: novelty,

                    requesterId: requesterId,
                    locationId: locationId,
                    category: category,
                    novelty: novelty,
                    management: management,
                    solution: solution || null,
                    timeSpentMinutes: timeSpent,

                    priority: 'media',
                    status: finalStatus,
                    createdAt: supportTimestamp,
                    closedAt: finalStatus === 'cerrado' ? supportTimestamp : null,
                    registeredAt: firebase.firestore.FieldValue.serverTimestamp(),

                    responsibleName: 'Jahan Michelle Chara',
                    isBacklogEntry: true,
                    autoClosed: type === 'ti' && finalStatus === 'cerrado',

                    fechaDeReporte: fecha,
                    horaDeReporte: hora,

                    externalProvider: isProvider ? platformName : null,
                    externalCaseNumber: null,
                    externalAdvisor: null,
                    externalStatus: isProvider ? 'cargado-atrasado' : null,
                    providerResponse: isProvider ? (solution || null) : null,

                    history: [
                        {
                            text: `<strong>Soporte atrasado cargado.</strong><br>${management}`,
                            timestamp: firebase.firestore.Timestamp.fromDate(new Date())
                        }
                    ]
                };

                await db.collection('tickets').doc(newTicketId).set(backlogData);
            }

            alert('¡Soportes atrasados guardados correctamente!');
            window.location.hash = '#tickets';

        } catch (error) {
            console.error('Error guardando soportes atrasados:', error);
            alert('No se pudieron guardar los soportes atrasados.');
        } finally {
            saveBtn.disabled = false;
            saveBtn.textContent = 'Guardar todos';
        }
    });
}
    async function renderTicketList(container, params = {}) { container.innerHTML = ticketListHTML; setupTableSearch('table-search-input', 'data-table'); const [reqSnap] = await Promise.all([db.collection('requesters').get()]); const requestersMap = {}; reqSnap.forEach(doc => requestersMap[doc.id] = doc.data().name); const tableBody = document.querySelector('#data-table tbody'); const ticketsListTitle = document.getElementById('tickets-list-title'); let title = 'Todos los Tickets'; if (params.status === 'abierto') { title = 'Tickets Abiertos'; } else if (params.status === 'cerrado') { title = 'Tickets Cerrados'; } ticketsListTitle.innerText = title; 
    let query = db.collection('tickets'); 
    if (params.status) { query = query.where('status', '==', params.status); } 
    query.onSnapshot(snapshot => { tableBody.innerHTML = ''; if (snapshot.empty) { tableBody.innerHTML = `<tr><td colspan="8">No hay tickets ${params.status ? title.toLowerCase() : ''}.</td></tr>`; return; } 
    let ticketsData = []; snapshot.forEach(doc => { ticketsData.push({ id: doc.id, ...doc.data() }); }); 
    ticketsData.sort((a,b) => (a.numericId || 0) - (b.numericId || 0)); 
    ticketsData.forEach(ticket => { const tr = document.createElement('tr'); const createdAt = ticket.createdAt ? ticket.createdAt.toDate().toLocaleDateString('es-ES') : 'N/A'; const closedAt = ticket.closedAt ? ticket.closedAt.toDate().toLocaleDateString('es-ES') : 'N/A'; const displayTitle = ticket.ticketType === 'ti' ? ticket.title : ticket.descripcionDeLaNovedad; const ticketTypeDisplay = ticket.ticketType ? capitalizar(ticket.ticketType) : 'TI'; tr.innerHTML = `<td>${ticket.id}</td><td><span class="status ${ticketTypeDisplay === 'TI' ? 'status-abierto' : 'status-en-curso'}">${ticketTypeDisplay}</span></td><td>${displayTitle ? (displayTitle.substring(0, 50) + (displayTitle.length > 50 ? '...' : '')) : 'Sin título'}</td><td>${requestersMap[ticket.requesterId] || 'N/A'}</td><td>${createdAt}</td><td>${closedAt}</td><td><span class="status status-${ticket.status}">${capitalizar(ticket.status.replace('-', ' '))}</span></td><td><button class="primary btn-accion-ticket" style="padding: 6px 12px; font-size: 12px; white-space: nowrap; width: auto;" data-id="${ticket.id}">Ver Detalles</button></td>`; tableBody.appendChild(tr); }); }, error => handleFirestoreError(error, tableBody)); }
    
    async function renderHistoryPage(container) {
    container.innerHTML = historyPageHTML;

    const form = document.getElementById('history-search-form');
    const searchInput = document.getElementById('history-search-text');
    const requesterSelect = document.getElementById('search-requester');
    const typeSelect = document.getElementById('search-ticket-type');
    const statusSelect = document.getElementById('search-status');
    const startDateInput = document.getElementById('search-start-date');
    const endDateInput = document.getElementById('search-end-date');
    const clearBtn = document.getElementById('history-clear-btn');
    const sortSelect = document.getElementById('history-sort-select');
    const timelineList = document.getElementById('history-timeline-list');
    const loadMoreBtn = document.getElementById('history-load-more');
    const exportTableBody = document.querySelector('#data-table tbody');

    let allTickets = [];
    let filteredTickets = [];
    let currentLimit = 8;
    const requestersMap = {};
    const locationsMap = {};

    function safeDate(ticket) {
        if (ticket.createdAt && ticket.createdAt.toDate) return ticket.createdAt.toDate();
        if (ticket.registeredAt && ticket.registeredAt.toDate) return ticket.registeredAt.toDate();
        return null;
    }

    function safeDateText(ticket) {
        const date = safeDate(ticket);
        return date ? date.toLocaleString('es-ES') : 'N/A';
    }

    function safeClosedText(ticket) {
        return ticket.closedAt && ticket.closedAt.toDate
            ? ticket.closedAt.toDate().toLocaleString('es-ES')
            : 'N/A';
    }

    function getTitle(ticket) {
        return ticket.title ||
            ticket.description ||
            ticket.descripcionDeLaNovedad ||
            ticket.novelty ||
            'Sin título';
    }

    function getTypeLabel(type) {
        const labels = {
            ti: 'TI',
            velocity: 'Velocity',
            siigo: 'Siigo',
            nota: 'Nota'
        };

        return labels[type] || capitalizar(type || 'TI');
    }

    function getStatusLabel(status) {
        const labels = {
            abierto: 'Abierto',
            'en-curso': 'En curso',
            cerrado: 'Cerrado',
            pendiente: 'Pendiente',
            convertida: 'Convertida'
        };

        return labels[status] || capitalizar(status || 'Sin estado');
    }

    function getPriorityLabel(priority) {
        if (!priority) return 'Media';
        return capitalizar(priority);
    }

    function getTypeIcon(type) {
        if (type === 'velocity') return '⚡';
        if (type === 'siigo') return 'S';
        if (type === 'nota') return '📝';
        return '🎧';
    }

    function getTypeClass(type) {
        if (type === 'velocity') return 'velocity';
        if (type === 'siigo') return 'siigo';
        if (type === 'nota') return 'nota';
        return 'ti';
    }

    function getDayGroupLabel(date) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        const target = new Date(date);
        target.setHours(0, 0, 0, 0);

        if (target.getTime() === today.getTime()) return 'Hoy';
        if (target.getTime() === yesterday.getTime()) return 'Ayer';

        return date.toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    }

    function matchesDateRange(ticket) {
        const ticketDate = safeDate(ticket);
        if (!ticketDate) return false;

        if (startDateInput.value) {
            const start = new Date(startDateInput.value);
            start.setHours(0, 0, 0, 0);

            if (ticketDate < start) return false;
        }

        if (endDateInput.value) {
            const end = new Date(endDateInput.value);
            end.setHours(23, 59, 59, 999);

            if (ticketDate > end) return false;
        }

        return true;
    }

    function applyFilters() {
        const searchTerm = searchInput.value.trim().toLowerCase();
        const requesterValue = requesterSelect.value;
        const typeValue = typeSelect.value;
        const statusValue = statusSelect.value;

        filteredTickets = allTickets.filter(ticket => {
            const title = getTitle(ticket).toLowerCase();
            const requesterName = (requestersMap[ticket.requesterId] || '').toLowerCase();
            const id = ticket.id.toLowerCase();

            const matchSearch = !searchTerm ||
                id.includes(searchTerm) ||
                title.includes(searchTerm) ||
                requesterName.includes(searchTerm);

            const matchRequester = !requesterValue || ticket.requesterId === requesterValue;
            const matchType = !typeValue || ticket.ticketType === typeValue;
            const matchStatus = !statusValue || ticket.status === statusValue;
            const matchDate = matchesDateRange(ticket);

            return matchSearch && matchRequester && matchType && matchStatus && matchDate;
        });

        filteredTickets.sort((a, b) => {
            const dateA = safeDate(a)?.getTime() || 0;
            const dateB = safeDate(b)?.getTime() || 0;

            return sortSelect.value === 'asc' ? dateA - dateB : dateB - dateA;
        });

        currentLimit = 8;

        renderSummary();
        renderTimeline();
        renderExportTable();
    }

    function renderSummary() {
        const total = filteredTickets.length;
        const closed = filteredTickets.filter(t => t.status === 'cerrado').length;
        const progress = filteredTickets.filter(t => t.status === 'en-curso' || t.status === 'abierto').length;
        const pending = filteredTickets.filter(t => t.status === 'pendiente').length;

        document.getElementById('history-total-count').textContent = total;
        document.getElementById('history-closed-count').textContent = closed;
        document.getElementById('history-progress-count').textContent = progress;
        document.getElementById('history-pending-count').textContent = pending;

        document.getElementById('history-results-counter').textContent =
            `Mostrando ${Math.min(currentLimit, total)} de ${total} resultados`;
    }

    function renderTimeline() {
        const visibleTickets = filteredTickets.slice(0, currentLimit);

        if (visibleTickets.length === 0) {
            timelineList.innerHTML = `
                <div class="history-empty-state">
                    No se encontraron soportes con esos filtros.
                </div>
            `;

            loadMoreBtn.style.display = 'none';
            document.getElementById('history-results-counter').textContent = 'Sin resultados';
            return;
        }

        let html = '';
        let lastGroup = '';

        visibleTickets.forEach(ticket => {
            const ticketDate = safeDate(ticket);
            const groupLabel = ticketDate ? getDayGroupLabel(ticketDate) : 'Sin fecha';
            const dateText = ticketDate ? ticketDate.toLocaleDateString('es-ES') : 'N/A';
            const timeText = ticketDate ? ticketDate.toLocaleTimeString('es-ES', {
                hour: '2-digit',
                minute: '2-digit'
            }) : 'N/A';

            if (groupLabel !== lastGroup) {
                html += `
                    <div class="history-day-group">
                        <div class="history-day-label">
                            <strong>${groupLabel}</strong>
                            <span>${dateText}</span>
                        </div>
                    </div>
                `;

                lastGroup = groupLabel;
            }

            const typeClass = getTypeClass(ticket.ticketType);
            const requester = requestersMap[ticket.requesterId] || 'Sin solicitante';
            const location = locationsMap[ticket.locationId] || ticket.locationId || 'Sin sede';
            const title = getTitle(ticket);
            const shortTitle = title.length > 70 ? title.substring(0, 70) + '...' : title;

            html += `
                <div class="history-timeline-row">
                    <div class="history-row-time">
                        <span>${timeText}</span>
                        <i class="${typeClass}"></i>
                    </div>

                    <div class="history-row-card">
                        <div class="history-row-main">
                            <div class="history-row-ticket">
                                <small>${ticket.id}</small>
                                <strong>${shortTitle}</strong>
                                <span>${requester} · ${location}</span>
                            </div>

                            <div class="history-row-field">
                                <label>Tipo</label>
                                <span class="history-pill type ${typeClass}">
                                    ${getTypeIcon(ticket.ticketType)} ${getTypeLabel(ticket.ticketType)}
                                </span>
                            </div>

                            <div class="history-row-field">
                                <label>Estado</label>
                                <span class="history-pill state ${ticket.status || 'abierto'}">
                                    ${getStatusLabel(ticket.status)}
                                </span>
                            </div>

                            <div class="history-row-field">
                                <label>Prioridad</label>
                                <span class="history-pill priority ${(ticket.priority || 'media').toLowerCase()}">
                                    ${getPriorityLabel(ticket.priority)}
                                </span>
                            </div>

                            <button class="history-view-btn btn-accion-ticket" data-id="${ticket.id}" title="Ver detalles">👁</button>
                        </div>
                    </div>
                </div>
            `;
        });

        timelineList.innerHTML = html;

        loadMoreBtn.style.display = filteredTickets.length > currentLimit ? 'inline-flex' : 'none';

        document.getElementById('history-results-counter').textContent =
            `Mostrando ${Math.min(currentLimit, filteredTickets.length)} de ${filteredTickets.length} resultados`;
    }

    function renderExportTable() {
        exportTableBody.innerHTML = '';

        filteredTickets.forEach(ticket => {
            const tr = document.createElement('tr');
            const title = getTitle(ticket);
            const requester = requestersMap[ticket.requesterId] || 'N/A';

            tr.innerHTML = `
                <td>${ticket.id}</td>
                <td>${title}</td>
                <td>${getTypeLabel(ticket.ticketType)}</td>
                <td>${requester}</td>
                <td>${safeDateText(ticket)}</td>
                <td>${safeClosedText(ticket)}</td>
                <td>${getStatusLabel(ticket.status)}</td>
                <td>${getPriorityLabel(ticket.priority)}</td>
                <td>Ver detalles</td>
            `;

            exportTableBody.appendChild(tr);
        });
    }

    try {
        const [ticketsSnap, reqSnap, locSnap] = await Promise.all([
            db.collection('tickets').get(),
            db.collection('requesters').orderBy('name').get(),
            db.collection('locations').orderBy('name').get()
        ]);

        requesterSelect.innerHTML = '<option value="">Todos</option>';

        reqSnap.forEach(doc => {
            requestersMap[doc.id] = doc.data().name;
            requesterSelect.innerHTML += `<option value="${doc.id}">${doc.data().name}</option>`;
        });

        locSnap.forEach(doc => {
            locationsMap[doc.id] = doc.data().name;
        });

        allTickets = ticketsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
            .filter(ticket => safeDate(ticket));

        applyFilters();

    } catch (error) {
        console.error('Error cargando historial:', error);
        timelineList.innerHTML = `
            <div class="history-empty-state">
                No se pudo cargar el historial. Revisa la consola.
            </div>
        `;
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        applyFilters();
    });

    clearBtn.addEventListener('click', () => {
        form.reset();
        applyFilters();
    });

    sortSelect.addEventListener('change', applyFilters);

    loadMoreBtn.addEventListener('click', () => {
        currentLimit += 8;
        renderTimeline();
    });
}
   async function renderEstadisticas(container) {
    container.innerHTML = statisticsHTML;

    const startDateInput = document.getElementById('stats-start-date');
    const endDateInput = document.getElementById('stats-end-date');
    const typeSelect = document.getElementById('stats-ticket-type');
    const statusSelect = document.getElementById('stats-status');
    const generateBtn = document.getElementById('generate-stats-report');
    const exportPdfBtn = document.getElementById('export-report-pdf');

    const now = new Date();
    const endDefault = new Date(now);
    const startDefault = new Date(now);
    startDefault.setDate(startDefault.getDate() - 30);

    startDateInput.value = startDefault.toISOString().split('T')[0];
    endDateInput.value = endDefault.toISOString().split('T')[0];

    const chartColors = {
        blue: '#2563eb',
        green: '#22c55e',
        orange: '#f97316',
        purple: '#8b5cf6',
        red: '#ef4444',
        cyan: '#14b8a6',
        gray: '#64748b',
        yellow: '#facc15'
    };

    function destroyChart(instanceName) {
        if (window[instanceName]) {
            window[instanceName].destroy();
        }
    }

    function getDate(ticket) {
        if (ticket.createdAt && ticket.createdAt.toDate) return ticket.createdAt.toDate();
        if (ticket.registeredAt && ticket.registeredAt.toDate) return ticket.registeredAt.toDate();
        return null;
    }

    function getClosedDate(ticket) {
        if (ticket.closedAt && ticket.closedAt.toDate) return ticket.closedAt.toDate();
        return null;
    }

    function formatMinutes(minutes) {
        const total = Number(minutes) || 0;
        const h = Math.floor(total / 60);
        const m = total % 60;
        return `${h}h ${m}m`;
    }

    function percent(value, total) {
        if (!total) return '0%';
        return `${((value / total) * 100).toFixed(1)}%`;
    }

    function getTypeLabel(type) {
        const labels = {
            ti: 'Soporte TI',
            velocity: 'Velocity',
            siigo: 'Siigo',
            nota: 'Nota rápida',
            otro: 'Otro'
        };

        return labels[type] || capitalizar(type || 'Otro');
    }

    function getCategoryLabel(ticket) {
        return ticket.category ||
            ticket.supportType ||
            ticket.ticketType ||
            'Sin categoría';
    }

    function getDeviceNamesFromTicket(ticket, devicesMap) {
        const possibleIds = [];

        if (Array.isArray(ticket.devices)) possibleIds.push(...ticket.devices);
        if (Array.isArray(ticket.deviceIds)) possibleIds.push(...ticket.deviceIds);
        if (Array.isArray(ticket.associatedDevices)) possibleIds.push(...ticket.associatedDevices);
        if (ticket.deviceId) possibleIds.push(ticket.deviceId);

        return possibleIds.map(id => {
            if (typeof id === 'string') {
                return devicesMap[id]?.name || devicesMap[id]?.code || id;
            }

            if (typeof id === 'object' && id !== null) {
                return id.name || id.code || id.id || 'Dispositivo sin nombre';
            }

            return 'Dispositivo sin nombre';
        });
    }

    function countBy(items, getter) {
        const result = {};

        items.forEach(item => {
            const key = getter(item) || 'Sin definir';
            result[key] = (result[key] || 0) + 1;
        });

        return result;
    }

    function sumBy(items, getter) {
        const result = {};

        items.forEach(item => {
            const key = getter(item.key) || 'Sin definir';
            result[key] = (result[key] || 0) + item.value;
        });

        return result;
    }

    function sortEntries(obj, limit = null) {
        const entries = Object.entries(obj).sort((a, b) => b[1] - a[1]);
        return limit ? entries.slice(0, limit) : entries;
    }

    function setText(id, value) {
        const el = document.getElementById(id);
        if (el) el.textContent = value;
    }

    function buildDateLabels(start, end) {
        const labels = [];
        const current = new Date(start);

        while (current <= end) {
            labels.push(new Date(current));
            current.setDate(current.getDate() + 1);
        }

        return labels;
    }

    function renderRanking(containerId, entries, emptyText) {
        const container = document.getElementById(containerId);

        if (!entries.length) {
            container.innerHTML = `<div class="reports-empty">No hay datos para mostrar.</div>`;
            return;
        }

        const max = Math.max(...entries.map(item => item[1])) || 1;

        container.innerHTML = entries.map(([label, value], index) => {
            const width = Math.round((value / max) * 100);

            return `
                <div class="reports-ranking-row">
                    <span class="reports-rank-number">${index + 1}</span>
                    <div class="reports-rank-content">
                        <strong>${label || emptyText}</strong>
                        <div class="reports-rank-bar">
                            <i style="width:${width}%"></i>
                        </div>
                    </div>
                    <em>${value}</em>
                </div>
            `;
        }).join('');
    }

    async function loadReport() {
        try {
            generateBtn.disabled = true;
            generateBtn.textContent = 'Generando...';

            const start = new Date(startDateInput.value + 'T00:00:00');
            const end = new Date(endDateInput.value + 'T23:59:59');

            const [ticketsSnap, requestersSnap, devicesSnap] = await Promise.all([
                db.collection('tickets').get(),
                db.collection('requesters').get(),
                db.collection('inventory').get()
            ]);

            const requestersMap = {};
            requestersSnap.forEach(doc => {
                requestersMap[doc.id] = doc.data().name || doc.id;
            });

            const devicesMap = {};
            devicesSnap.forEach(doc => {
                devicesMap[doc.id] = {
                    id: doc.id,
                    ...doc.data()
                };
            });

            let tickets = ticketsSnap.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })).filter(ticket => {
                const date = getDate(ticket);
                if (!date) return false;

                const matchDate = date >= start && date <= end;
                const matchType = !typeSelect.value || ticket.ticketType === typeSelect.value;
                const matchStatus = !statusSelect.value || ticket.status === statusSelect.value;

                return matchDate && matchType && matchStatus;
            });

            const total = tickets.length;
            const closed = tickets.filter(t => t.status === 'cerrado').length;
            const progress = tickets.filter(t => t.status === 'en-curso' || t.status === 'abierto').length;
            const pending = tickets.filter(t => t.status === 'pendiente').length;
            const totalMinutes = tickets.reduce((sum, ticket) => sum + (Number(ticket.timeSpentMinutes) || 0), 0);

            const categoryCounts = countBy(tickets, ticket => getCategoryLabel(ticket));
            const requesterCounts = countBy(tickets, ticket => requestersMap[ticket.requesterId] || 'Sin solicitante');

            const topCategory = sortEntries(categoryCounts, 1)[0];
            const topRequester = sortEntries(requesterCounts, 1)[0];

            setText('reports-total-tickets', total);
            setText('reports-closed-tickets', closed);
            setText('reports-progress-tickets', progress);
            setText('reports-time-spent', formatMinutes(totalMinutes));

            setText('reports-total-percent', total ? '100% del periodo' : 'Sin tickets en el periodo');
            setText('reports-closed-percent', `${percent(closed, total)} del total`);
            setText('reports-progress-percent', `${percent(progress, total)} del total`);

            setText('reports-top-category', topCategory ? capitalizar(topCategory[0]) : 'N/A');
            setText('reports-top-category-count', topCategory ? `${topCategory[1]} tickets` : '0 tickets');

            setText('reports-top-requester', topRequester ? topRequester[0] : 'N/A');
            setText('reports-top-requester-count', topRequester ? `${topRequester[1]} tickets` : '0 tickets');

            renderStatusChart(total, closed, progress, pending);
            renderTypeChart(tickets);
            renderFlowChart(tickets, start, end);
            renderTimeByCategoryChart(tickets);
            renderTopLists(tickets, requestersMap, devicesMap);
            let inventoryDevices = devicesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            if (inventoryDevices.length === 0) {
                inventoryDevices = buildInventoryFromTicketDevices(tickets);
            }

            renderInventoryCharts(inventoryDevices);

        } catch (error) {
            console.error('Error generando reporte:', error);
            alert('No se pudo generar el reporte. Revisa la consola.');
        } finally {
            generateBtn.disabled = false;
            generateBtn.textContent = 'Generar reporte';
        }
    }

    function renderStatusChart(total, closed, progress, pending) {
        destroyChart('reportStatusChartInstance');

        const ctx = document.getElementById('reportStatusChart').getContext('2d');

        window.reportStatusChartInstance = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Cerrados', 'En curso', 'Pendientes'],
                datasets: [{
                    data: [closed, progress, pending],
                    backgroundColor: [chartColors.green, chartColors.orange, chartColors.purple],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '65%',
                plugins: {
                    legend: {
                        position: 'right'
                    }
                }
            },
            plugins: [{
                id: 'centerText',
                beforeDraw(chart) {
                    const { ctx, chartArea } = chart;
                    if (!chartArea) return;

                    ctx.save();
                    ctx.font = '800 24px Arial';
                    ctx.fillStyle = '#0f172a';
                    ctx.textAlign = 'center';
                    ctx.fillText(total, (chartArea.left + chartArea.right) / 2, (chartArea.top + chartArea.bottom) / 2 - 4);

                    ctx.font = '700 12px Arial';
                    ctx.fillStyle = '#64748b';
                    ctx.fillText('Total', (chartArea.left + chartArea.right) / 2, (chartArea.top + chartArea.bottom) / 2 + 18);
                    ctx.restore();
                }
            }]
        });
    }

    function renderTypeChart(tickets) {
        destroyChart('reportTypeChartInstance');

        const counts = countBy(tickets, ticket => getTypeLabel(ticket.ticketType));
        const entries = sortEntries(counts);

        const ctx = document.getElementById('reportTypeChart').getContext('2d');

        window.reportTypeChartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: entries.map(e => e[0]),
                datasets: [{
                    label: 'Tickets',
                    data: entries.map(e => e[1]),
                    backgroundColor: chartColors.blue,
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            precision: 0
                        }
                    }
                }
            }
        });
    }

    function renderFlowChart(tickets, start, end) {
        destroyChart('reportFlowChartInstance');

        const days = buildDateLabels(start, end);

        const createdData = days.map(day => {
            const startDay = new Date(day);
            startDay.setHours(0, 0, 0, 0);

            const endDay = new Date(day);
            endDay.setHours(23, 59, 59, 999);

            return tickets.filter(ticket => {
                const date = getDate(ticket);
                return date && date >= startDay && date <= endDay;
            }).length;
        });

        const closedData = days.map(day => {
            const startDay = new Date(day);
            startDay.setHours(0, 0, 0, 0);

            const endDay = new Date(day);
            endDay.setHours(23, 59, 59, 999);

            return tickets.filter(ticket => {
                const date = getClosedDate(ticket);
                return date && date >= startDay && date <= endDay;
            }).length;
        });

        const ctx = document.getElementById('reportFlowChart').getContext('2d');

        window.reportFlowChartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: days.map(day => day.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })),
                datasets: [
                    {
                        label: 'Creados',
                        data: createdData,
                        borderColor: chartColors.blue,
                        backgroundColor: 'rgba(37,99,235,0.08)',
                        fill: true,
                        tension: 0.35,
                        pointRadius: 3
                    },
                    {
                        label: 'Cerrados',
                        data: closedData,
                        borderColor: chartColors.green,
                        backgroundColor: 'rgba(34,197,94,0.08)',
                        fill: true,
                        tension: 0.35,
                        pointRadius: 3
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            precision: 0
                        }
                    }
                }
            }
        });
    }

    function renderTimeByCategoryChart(tickets) {
        destroyChart('reportTimeByCategoryChartInstance');

        const minutesByCategory = {};

        tickets.forEach(ticket => {
            const category = capitalizar(getCategoryLabel(ticket));
            minutesByCategory[category] = (minutesByCategory[category] || 0) + (Number(ticket.timeSpentMinutes) || 0);
        });

        const entries = sortEntries(minutesByCategory, 6);

        const ctx = document.getElementById('reportTimeByCategoryChart').getContext('2d');

        window.reportTimeByCategoryChartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: entries.map(e => e[0]),
                datasets: [{
                    label: 'Horas',
                    data: entries.map(e => Number((e[1] / 60).toFixed(1))),
                    backgroundColor: chartColors.blue,
                    borderRadius: 4
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    function renderTopLists(tickets, requestersMap, devicesMap) {
        const requesterCounts = countBy(tickets, ticket => requestersMap[ticket.requesterId] || 'Sin solicitante');
        renderRanking('reports-top-requesters-list', sortEntries(requesterCounts, 5), 'Sin solicitante');

        const deviceCounts = {};

        tickets.forEach(ticket => {
            const deviceNames = getDeviceNamesFromTicket(ticket, devicesMap);

            if (!deviceNames.length) return;

            deviceNames.forEach(name => {
                deviceCounts[name] = (deviceCounts[name] || 0) + 1;
            });
        });

        renderRanking('reports-top-devices-list', sortEntries(deviceCounts, 5), 'Sin dispositivo');
    }
       function buildInventoryFromTicketDevices(tickets) {
    const deviceMap = new Map();

    function inferCategoryFromId(deviceId) {
        const id = String(deviceId || '').toUpperCase();

        if (id.startsWith('PC-')) return 'computers';
        if (id.startsWith('TEL-')) return 'phones';
        if (id.startsWith('CAM-')) return 'cameras';
        if (id.startsWith('MOD-')) return 'modems';
        if (id.startsWith('COM-')) return 'communicators';
        if (id.startsWith('NET-')) return 'network';
        if (id.startsWith('IMP-')) return 'printers';

        return 'Sin categoría';
    }

    tickets.forEach(ticket => {
        const deviceIds = [];

        if (Array.isArray(ticket.deviceIds)) deviceIds.push(...ticket.deviceIds);
        if (Array.isArray(ticket.devices)) deviceIds.push(...ticket.devices);
        if (Array.isArray(ticket.associatedDevices)) deviceIds.push(...ticket.associatedDevices);
        if (ticket.deviceId) deviceIds.push(ticket.deviceId);

        deviceIds.forEach(deviceId => {
            if (!deviceId) return;

            const cleanId = String(deviceId).trim();

            if (!deviceMap.has(cleanId)) {
                deviceMap.set(cleanId, {
                    id: cleanId,
                    category: inferCategoryFromId(cleanId),
                    os: null,
                    source: 'tickets'
                });
            }
        });
    });

    return Array.from(deviceMap.values());
}
       function renderInventoryCharts(devices) {
    const totalDevices = devices.length;
    setText('reports-total-devices', `Total de dispositivos: ${totalDevices}`);

    const categoryLabels = {
        computers: 'Computadores',
        phones: 'Teléfonos',
        cameras: 'Cámaras',
        modems: 'Módems',
        communicators: 'Comunicadores',
        network: 'Dispositivos de Red',
        printers: 'Impresoras'
    };

    const categoryCounts = {};

    devices.forEach(device => {
        const categoryKey = device.category || 'Sin categoría';
        const label = categoryLabels[categoryKey] || capitalizar(categoryKey);

        categoryCounts[label] = (categoryCounts[label] || 0) + 1;
    });

    destroyChart('reportInventoryCategoryChartInstance');

    const categoryEntries = sortEntries(categoryCounts, 8);
    const categoryCtx = document.getElementById('reportInventoryCategoryChart').getContext('2d');

    window.reportInventoryCategoryChartInstance = new Chart(categoryCtx, {
        type: 'bar',
        data: {
            labels: categoryEntries.map(e => e[0]),
            datasets: [{
                label: '# de dispositivos',
                data: categoryEntries.map(e => e[1]),
                backgroundColor: chartColors.blue,
                borderRadius: 4
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    ticks: {
                        precision: 0
                    }
                }
            }
        }
    });

    const computers = devices.filter(device => device.category === 'computers');

    setText('reports-total-computers', `Total de computadores: ${computers.length}`);

    const osCounts = {};

    computers.forEach(computer => {
        const osValue = computer.os || 'Sin SO';
        osCounts[osValue] = (osCounts[osValue] || 0) + 1;
    });

    destroyChart('reportOSChartInstance');

    const osEntries = sortEntries(osCounts);
    const osCtx = document.getElementById('reportOSChart').getContext('2d');

    window.reportOSChartInstance = new Chart(osCtx, {
        type: 'doughnut',
        data: {
            labels: osEntries.map(e => e[0]),
            datasets: [{
                data: osEntries.map(e => e[1]),
                backgroundColor: [
                    chartColors.blue,
                    chartColors.green,
                    chartColors.orange,
                    chartColors.purple,
                    chartColors.cyan,
                    chartColors.gray
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '65%',
            plugins: {
                legend: {
                    position: 'right'
                }
            }
        }
    });
}
    generateBtn.addEventListener('click', loadReport);

    exportPdfBtn.addEventListener('click', () => {
        window.print();
    });

    loadReport();
}
    function renderGenericListPage(container, params, configObject, collectionName, icon) { 
        container.innerHTML = genericListPageHTML; 
        setupTableSearch('table-search-input', 'data-table'); 
        const category = params.category; 
        const config = configObject[category]; 
        if (!config) { container.innerHTML = `<h1>Error: Categoría no encontrada.</h1>`; return; } 

        const iconEdit = `<svg style="pointer-events:none; width:20px; height:20px; fill:#2563eb;" viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>`; 
        const iconView = `<svg style="pointer-events:none; width:20px; height:20px; fill:#475569;" viewBox="0 0 24 24"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>`;
        const iconDelete = `<svg style="pointer-events:none; width:20px; height:20px; fill:#dc2626;" viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>`; 
        
        document.getElementById('page-title').innerText = `${icon} ${config.title}`; 
        document.getElementById('item-list-title').innerText = `Lista de ${config.title}`; 
        const addButton = document.getElementById('add-item-btn'); 
        addButton.innerText = `Añadir ${config.titleSingular}`; 
        addButton.dataset.type = collectionName; 
        addButton.dataset.category = category; 
        const tableHeadContainer = document.getElementById('item-table-head'); 
        const tableHeaders = Object.values(config.fields).map(field => field.label); 
        tableHeadContainer.innerHTML = `<tr>${tableHeaders.map(h => `<th>${h}</th>`).join('')}<th>Acciones</th></tr>`; 
        const tableBody = document.getElementById('item-table-body'); 
        
        db.collection(collectionName).where('category', '==', category).onSnapshot(snapshot => { 
            tableBody.innerHTML = ''; 
            if (snapshot.empty) { tableBody.innerHTML = `<tr><td colspan="${tableHeaders.length + 1}">No hay elementos.</td></tr>`; return; } 
            
            let itemsData = [];
            snapshot.forEach(doc => itemsData.push({ id: doc.id, ...doc.data() }));
            itemsData.sort((a,b) => (a.numericId||0) - (b.numericId||0));

            itemsData.forEach(item => { 
                const tr = document.createElement('tr'); 
                tr.dataset.id = item.id; 
                let cellsHTML = ''; 
                for (const key of Object.keys(config.fields)) { 
                    let cellContent = key === 'id' ? item.id : (item[key] || 'N/A'); 
                    if (key === 'os' && cellContent !== 'N/A' && collectionName === 'inventory') { cellContent = `<a href="#credentials-software" style="color: blue; text-decoration: underline;">${cellContent}</a>`; } 
                    
                    if (key === 'status') { 
                        const statusClass = (cellContent || '').toLowerCase().replace(/ /g, '-'); 
                        let bgC = '#e2e8f0', textC = '#475569'; // Colores por defecto
                        if (statusClass === 'activo') { bgC = '#dcfce3'; textC = '#166534'; }
                        else if (statusClass === 'inactivo') { bgC = '#fee2e2'; textC = '#dc2626'; }
                        
                        cellsHTML += `<td data-field="${key}"><span class="status status-${statusClass}" style="background-color: ${bgC} !important; color: ${textC} !important; padding: 4px 10px; border-radius: 9999px; font-weight: 600; font-size: 12px; display: inline-block;">${capitalizar(cellContent)}</span></td>`; 
                    } 
                    else { cellsHTML += `<td data-field="${key}"><span class="cell-text">${cellContent}</span></td>`; } 
                } 
                
                let actionsHTML = `<div class="action-icon-edit" style="cursor:pointer; display:inline-flex; align-items:center; justify-content:center; width:32px; height:32px; border-radius:6px; background:transparent !important; border:none; margin:0 4px; box-shadow:none; padding:0;" title="Editar" data-id="${item.id}" data-collection="${collectionName}" data-category="${category}">${iconEdit}</div>`; 
                actionsHTML += `<div class="action-icon-view" style="cursor:pointer; display:inline-flex; align-items:center; justify-content:center; width:32px; height:32px; border-radius:6px; background:transparent !important; border:none; margin:0 4px; box-shadow:none; padding:0;" title="Ver Detalles" data-id="${item.id}">${iconView}</div>`; 
                actionsHTML += `<div class="action-icon-delete" style="cursor:pointer; display:inline-flex; align-items:center; justify-content:center; width:32px; height:32px; border-radius:6px; background:transparent !important; border:none; margin:0 4px; box-shadow:none; padding:0;" title="Eliminar" data-id="${item.id}" data-collection="${collectionName}">${iconDelete}</div>`; 
                
                tr.innerHTML = `${cellsHTML}<td><div style="display:flex; justify-content:center; align-items:center;">${actionsHTML}</div></td>`; 
                tableBody.appendChild(tr); 
            }); 
        }, error => handleFirestoreError(error, tableBody)); 
    }
    
    async function showDeviceHistoryModal(deviceId) { 
        const historyModal = document.getElementById('history-modal'); 
        const modalBody = historyModal.querySelector('#history-modal-body'); 
        modalBody.innerHTML = `<h2>Historial de Tickets para ${deviceId}</h2><p>Cargando historial...</p>`; 
        historyModal.classList.remove('hidden'); 
        try { 
            const snapshot = await db.collection('tickets').where('deviceIds', 'array-contains', deviceId).get(); 
            if (snapshot.empty) { modalBody.innerHTML = `<h2>Historial de Tickets para ${deviceId}</h2><p>No hay tickets asociados a este dispositivo.</p>`; return; } 
            
            let ticketsData = [];
            snapshot.forEach(doc => ticketsData.push({ id: doc.id, ...doc.data() }));
            ticketsData.sort((a,b) => (b.createdAt?.toMillis()||0) - (a.createdAt?.toMillis()||0));

            let historyHTML = `<h2>Historial de Tickets para ${deviceId}</h2><ul class="simple-list" style="list-style-type: none; padding-left: 0;">`; 
            ticketsData.forEach(ticket => { 
                const ticketDate = ticket.createdAt ? ticket.createdAt.toDate().toLocaleDateString('es-ES') : 'Fecha N/A'; 
                historyHTML += `<li style="display:flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid #eee;"><div style="display:flex; flex-direction:column; gap:4px; max-width: 75%;"><div style="font-weight: 600; color: #1e293b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;"><a href="#" class="view-ticket-btn" data-id="${ticket.id}" style="color: #2563eb !important; background: transparent !important; padding: 0 !important; border: none !important; box-shadow: none !important; text-decoration: underline !important; font-size:14px;">#${ticket.id}</a><span style="color: #475569; font-weight: normal; font-size:14px;"> - ${ticket.title || 'Sin título'}</span></div><div style="font-size: 12px; color: #64748b;">📅 ${ticketDate}</div></div><div><span class="status status-${ticket.status}">${capitalizar(ticket.status)}</span></div></li>`; 
            }); 
            historyHTML += '</ul>'; modalBody.innerHTML = historyHTML; 
        } catch (error) { 
            console.error("Error al cargar historial de tickets:", error); 
            modalBody.innerHTML = `<h2>Historial de Tickets para ${deviceId}</h2><p style="color:red;">Error al cargar el historial.</p>`; 
        } 
    }
    
    function renderMaintenanceCalendar(container) { container.innerHTML = maintenanceCalendarHTML; const calendarEl = document.getElementById('maintenance-calendar'); const dataTable = document.getElementById('data-table'); db.collection('maintenance').where('status', 'in', ['planificada', 'completada']).onSnapshot(snapshot => { const eventColors = { 'Mantenimiento Preventivo': '#dc3545', 'Mantenimiento Correctivo': '#ffc107', 'Mantenimiento Lógico': '#6f42c1', 'Backup': '#fd7e14', 'Tarea': '#007bff', 'Recordatorio': '#17a2b8' }; const events = snapshot.docs.map(doc => { const data = doc.data(); let color = eventColors[data.type] || '#6c757d'; if (data.status === 'completada') color = '#28a745'; return { id: doc.id, title: data.task, start: data.date, color: color, extendedProps: { status: data.status, ...data } }; }); const calendar = new FullCalendar.Calendar(calendarEl, { headerToolbar: { left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek' }, initialView: 'dayGridMonth', locale: 'es', buttonText: { today: 'hoy', month: 'mes', week: 'semana', day: 'día', list: 'agenda' }, events: events, eventClick: function(info) { showEventActionChoiceModal(info.event.id, info.event.title, info.event.extendedProps); } }); calendar.render(); const tableHeaders = ['Tarea', 'Fecha Programada', 'Tipo', 'Estado']; const tableRows = snapshot.docs.map(doc => { const data = doc.data(); return [data.task, data.date, data.type, data.status]; }); dataTable.innerHTML = `<thead><tr>${tableHeaders.map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody>${tableRows.map(row => `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`).join('')}</tbody>`; }, error => handleFirestoreError(error, calendarEl)); }
    
    function renderConfiguracion(container) { 
        container.innerHTML = configHTML; 
        const setupConfigSection = (type, collectionName, prefix, counterName) => { 
            const form = document.getElementById(`add-${type}-form`); 
            if(!form) return; 
            const input = document.getElementById(`${type}-name`); 
            const list = document.getElementById(`${type}s-list`); 
            
            const iconEdit = `<svg style="pointer-events:none; width:20px; height:20px; fill:#2563eb;" viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>`; 
            const iconDelete = `<svg style="pointer-events:none; width:20px; height:20px; fill:#dc2626;" viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>`; 
            
            form.addEventListener('submit', async (e) => { 
                e.preventDefault(); 
                const name = input.value.trim(); 
                if (!name) return; 
                const counterRef = db.collection('counters').doc(counterName); 
                try { 
                    let newId; let newNumber; 
                    await db.runTransaction(async (transaction) => { 
                        const counterDoc = await transaction.get(counterRef); 
                        if (!counterDoc.exists) { throw `El contador '${counterName}' no existe en Firebase.`; } 
                        newNumber = counterDoc.data().currentNumber + 1; 
                        transaction.update(counterRef, { currentNumber: newNumber }); 
                        newId = `${prefix}${newNumber}`; 
                    }); 
                    await db.collection(collectionName).doc(newId).set({ name: name, numericId: newNumber }); 
                    form.reset(); 
                } catch (error) { 
                    console.error("Error al crear item:", error); alert("No se pudo crear el nuevo ítem."); 
                } 
            }); 
            
            db.collection(collectionName).orderBy("numericId", "asc").onSnapshot(snapshot => { 
                list.innerHTML = ''; 
                snapshot.forEach(doc => { 
                    const item = { id: doc.id, ...doc.data() }; 
                    const li = document.createElement('li'); 
                    li.className = 'config-list-item'; 
                    li.innerHTML = `<div><strong style="margin-right: 10px;">${item.id}</strong><span class="config-item-name">${item.name}</span></div><div style="display:flex; align-items:center;"><div class="action-icon-edit" style="cursor:pointer; display:inline-flex; align-items:center; justify-content:center; width:32px; height:32px; background:transparent !important; border:none; margin:0 4px; box-shadow:none; padding:0;" data-collection="${collectionName}" data-id="${item.id}" data-type="config">${iconEdit}</div><div class="action-icon-delete" style="cursor:pointer; display:inline-flex; align-items:center; justify-content:center; width:32px; height:32px; background:transparent !important; border:none; margin:0 4px; box-shadow:none; padding:0;" data-id="${item.id}" data-collection="${collectionName}">${iconDelete}</div></div>`; 
                    list.appendChild(li); 
                }); 
            }, error => handleFirestoreError(error, list)); 
        }; 
        
        setupConfigSection('requester', 'requesters', 'REQ-', 'requesterCounter'); 
        setupConfigSection('location', 'locations', 'LOC-', 'locationCounter'); 
        setupConfigSection('atencion', 'credentials', 'CRED-APPAT-', 'atencionCounter'); 
    }
    
    async function showItemFormModal(type, category = null, docId = null) { const formModal = document.getElementById('form-modal'); const modalBody = formModal.querySelector('#form-modal-body'); try { const isEditing = docId !== null; let formHTML = '', title = '', collectionName = '', formId = 'modal-form', config; let existingData = {}; if (isEditing) { const collectionForSearch = (type === 'config') ? category : type; const docSnap = await db.collection(collectionForSearch).doc(docId).get(); if (docSnap.exists) { existingData = docSnap.data(); } else { alert("Error: No se encontró el elemento a editar."); return; } } let softwareLicenseDetails = null; const shouldFetchLicenseDetails = isEditing && type === 'inventory' && category === 'computers' && existingData.os; if (shouldFetchLicenseDetails) { const licenseDocSnap = await db.collection('credentials').doc(existingData.os).get(); if (licenseDocSnap.exists) { softwareLicenseDetails = licenseDocSnap.data(); } } const configObject = (type === 'inventory') ? inventoryCategoryConfig : (type === 'credentials') ? credentialsCategoryConfig : (type === 'services') ? servicesCategoryConfig : {}; config = configObject[category]; if (!config) { if (type === 'maintenance') { title = isEditing ? 'Editar Tarea' : 'Programar Tarea'; collectionName = 'maintenance'; const task = existingData.task || ''; const date = existingData.date || ''; const taskType = existingData.type || 'Tarea'; formHTML = `<div class="form-group"><label for="form-task">Título de la Tarea</label><input type="text" id="form-task" name="task" value="${task}" required></div><div class="form-group"><label for="form-date">Fecha</label><input type="date" id="form-date" name="date" value="${date}" required></div><div class="form-group"><label for="form-type">Tipo de Tarea</label><select id="form-type" name="type"><option value="Mantenimiento Preventivo" ${taskType === 'Mantenimiento Preventivo' ? 'selected' : ''}>Mantenimiento Preventivo</option><option value="Mantenimiento Correctivo" ${taskType === 'Mantenimiento Correctivo' ? 'selected' : ''}>Mantenimiento Correctivo</option><option value="Mantenimiento Lógico" ${taskType === 'Mantenimiento Lógico' ? 'selected' : ''}>Mantenimiento Lógico</option><option value="Backup" ${taskType === 'Backup' ? 'selected' : ''}>Backup</option><option value="Tarea" ${taskType === 'Tarea' ? 'selected' : ''}>Tarea</option><option value="Recordatorio" ${taskType === 'Recordatorio' ? 'selected' : ''}>Recordatorio</option></select></div>`; } else if (type === 'config') { collectionName = category; title = isEditing ? `Editar ${collectionName === 'requesters' ? 'Solicitante' : 'Ubicación'}` : `Añadir ${collectionName === 'requesters' ? 'Solicitante' : 'Ubicación'}`; const name = existingData.name || ''; formHTML = `<div class="form-group"><label for="form-name">Nombre</label><input type="text" id="form-name" name="name" value="${name}" required></div>`; } } else { title = isEditing ? `Editar ${config.titleSingular}` : `Añadir ${config.titleSingular}`; collectionName = type; let fieldsHTML = ''; for (const [key, field] of Object.entries(config.fields)) { if (key === 'id') continue; const value = existingData[key] || ''; const isRequired = field.required ? 'required' : ''; let inputHTML = ''; if (field.readonly) { let displayValue = value || 'N/A'; if (key === 'os' && softwareLicenseDetails) { displayValue = `${softwareLicenseDetails.softwareName} (${softwareLicenseDetails.version || 'sin versión'})`; } fieldsHTML += `<div class="form-group"><label for="form-${key}">${field.label}</label><input type="text" id="form-${key}" name="${key}" value="${displayValue}" readonly style="background:#eee;"></div>`; continue; } if (field.type === 'text' && field.optionsSource === 'computers-inventory') { const datalistId = `datalist-for-${key}`; const placeholder = field.placeholder || ''; let displayValue = value; const allComputersSnap = await db.collection('inventory').where('category', '==', 'computers').get(); const computerOptions = allComputersSnap.docs.map(doc => { const d = doc.data(); return { id: doc.id, fullText: `${doc.id}: ${d.brand || ''} ${d.model || ''} (${d.user || 'Sin Usuario'})` }; }); const optionsHTML = computerOptions.map(opt => `<option value="${opt.fullText}"></option>`).join(''); if (isEditing && displayValue) { const matchingOption = computerOptions.find(opt => opt.id === displayValue); if (matchingOption) { displayValue = matchingOption.fullText; } } inputHTML = `<input type="text" id="form-${key}" name="${key}" value="${displayValue}" list="${datalistId}" placeholder="${placeholder}" ${isRequired} autocomplete="off"><datalist id="${datalistId}">${optionsHTML}</datalist>`; } else if (field.type === 'select') { let optionsHTML = ''; if (field.optionsSource === 'locations') { const locSnap = await db.collection('locations').get(); optionsHTML += locSnap.docs.map(doc => `<option value="${doc.id}" ${doc.id === value ? 'selected' : ''}>${doc.id}: ${doc.data().name}</option>`).join(''); } else if (field.optionsSource === 'computers-inventory') { const computersMap = new Map(); const allComputersSnap = await db.collection('inventory').where('category', '==', 'computers').get(); allComputersSnap.forEach(doc => { const computerData = doc.data(); if (!computerData.os) { computersMap.set(doc.id, `${doc.id}: ${computerData.brand} ${computerData.model}`); } }); if (isEditing && value && !computersMap.has(value)) { const currentCompSnap = await db.collection('inventory').doc(value).get(); if (currentCompSnap.exists) { const d = currentCompSnap.data(); computersMap.set(currentCompSnap.id, `${d.id}: ${d.brand} ${d.model} (Asignado actualmente)`); } } for (const [id, name] of computersMap.entries()) { optionsHTML += `<option value="${id}" ${id === value ? 'selected' : ''}>${name}</option>`; } } else if (field.optionsSource === 'software-licenses') { const licensesMap = new Map(); const allLicensesSnap = await db.collection('credentials').where('category', '==', 'software').get(); allLicensesSnap.forEach(doc => { const licenseData = doc.data(); if (!licenseData.assignedTo) { licensesMap.set(doc.id, `${doc.id}: ${licenseData.softwareName} v${licenseData.version || '?'}`); } }); if (isEditing && value && !licensesMap.has(value)) { const currentLicenseSnap = await db.collection('credentials').doc(value).get(); if (currentLicenseSnap.exists) { const d = currentLicenseSnap.data(); licensesMap.set(currentLicenseSnap.id, `${d.id}: ${d.softwareName} v${d.version || '?'} (Asignada actualmente)`); } } for (const [id, name] of licensesMap.entries()) { optionsHTML += `<option value="${id}" ${id === value ? 'selected' : ''}>${name}</option>`; } } else { optionsHTML += field.options.map(opt => `<option value="${opt}" ${opt === value ? 'selected' : ''}>${opt}</option>`).join(''); } inputHTML = `<select id="form-${key}" name="${key}" ${isRequired}><option value="">(No asignar / Ninguna)</option>${optionsHTML}</select>`; } else if (field.type === 'textarea') { inputHTML = `<textarea id="form-${key}" name="${key}" rows="3" ${isRequired}>${value}</textarea>`; } else { inputHTML = `<input type="${field.type || 'text'}" id="form-${key}" name="${key}" value="${value}" ${isRequired}>`; } fieldsHTML += `<div class="form-group"><label for="form-${key}">${field.label}</label>${inputHTML}</div>`; } formHTML = `<div class="inventory-form-grid">${fieldsHTML}</div>`; if (isEditing && type === 'inventory') { formHTML += `<hr style="margin-top: 25px; margin-bottom: 15px;"><h3>Historial de Tickets Asociados</h3><div id="device-ticket-history" style="max-height: 200px; overflow-y: auto;">Cargando historial...</div>`; } } modalBody.innerHTML = `<h2>${title}</h2><form id="${formId}">${formHTML}<div style="text-align:right; margin-top:20px;"><button type="submit" class="primary">${isEditing ? 'Guardar Cambios' : 'Guardar'}</button></div></form>`; formModal.classList.remove('hidden'); if (isEditing && type === 'inventory') { setTimeout(() => { const historyContainer = document.getElementById('device-ticket-history'); if (historyContainer) { db.collection('tickets').where('deviceIds', 'array-contains', docId).get().then(snapshot => { if (snapshot.empty) { historyContainer.innerHTML = '<p>No hay tickets asociados a este dispositivo.</p>'; return; } let ticketsData = []; snapshot.forEach(doc => ticketsData.push({id: doc.id, ...doc.data()})); ticketsData.sort((a,b) => (b.createdAt?.toMillis()||0) - (a.createdAt?.toMillis()||0)); let historyHTML = '<ul class="simple-list" style="list-style-type: none; padding-left: 0;">'; ticketsData.forEach(ticket => { const ticketDate = ticket.createdAt ? ticket.createdAt.toDate().toLocaleDateString('es-ES') : 'Fecha N/A'; historyHTML += `<li style="display:flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid #eee;"><div style="display:flex; flex-direction:column; gap:4px; max-width: 75%;"><div style="font-weight: 600; color: #1e293b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;"><a href="#" class="view-ticket-btn" data-id="${ticket.id}" style="color: #2563eb !important; background: transparent !important; padding: 0 !important; border: none !important; box-shadow: none !important; text-decoration: underline !important; font-size:14px;">#${ticket.id}</a><span style="color: #475569; font-weight: normal; font-size:14px;"> - ${ticket.title || 'Sin título'}</span></div><div style="font-size: 12px; color: #64748b;">📅 ${ticketDate}</div></div><div><span class="status status-${ticket.status}">${capitalizar(ticket.status)}</span></div></li>`; }); historyHTML += '</ul>'; historyContainer.innerHTML = historyHTML; }); } }, 100); } document.getElementById(formId).addEventListener('submit', async (e) => { e.preventDefault(); const form = e.target; const data = {}; const formData = new FormData(form); formData.forEach((value, key) => { const fieldConfig = config.fields[key]; if (fieldConfig && fieldConfig.type === 'text' && fieldConfig.optionsSource === 'computers-inventory') { if (value && value.includes(':')) { data[key] = value.split(':')[0].trim(); } else { data[key] = value; } } else { data[key] = value; } }); try { if (isEditing) { if (type === 'credentials' && category === 'software') { const newComputerId = data.assignedTo || null; const oldComputerId = existingData.assignedTo || null; if (newComputerId !== oldComputerId) { await db.runTransaction(async (transaction) => { const licenseRef = db.collection('credentials').doc(docId); transaction.update(licenseRef, data); if (oldComputerId) { const oldCompRef = db.collection('inventory').doc(oldComputerId); transaction.update(oldCompRef, { os: null }); } if (newComputerId) { const newCompRef = db.collection('inventory').doc(newComputerId); transaction.update(newCompRef, { os: docId }); } }); } else { await db.collection(collectionName).doc(docId).update(data); } } else if (type === 'inventory' && category === 'computers') { const newLicenseId = data.os || null; const oldLicenseId = existingData.os || null; if (newLicenseId !== oldLicenseId) { await db.runTransaction(async (transaction) => { const computerRef = db.collection('inventory').doc(docId); transaction.update(computerRef, data); if (oldLicenseId) { const oldLicenseRef = db.collection('credentials').doc(oldLicenseId); transaction.update(oldLicenseRef, { assignedTo: null }); } if (newLicenseId) { const newLicenseRef = db.collection('credentials').doc(newLicenseId); transaction.update(newLicenseRef, { assignedTo: docId }); } }); } else { await db.collection(collectionName).doc(docId).update(data); } } else { await db.collection(collectionName).doc(docId).update(data); } } else { if (type === 'inventory' || type === 'credentials' || type === 'services') { data.category = category; const { prefix, counter } = config; if (!prefix || !counter) { alert('Error de configuración.'); return; } const counterRef = db.collection('counters').doc(counter); let newId, newNumber; await db.runTransaction(async (transaction) => { const counterDoc = await transaction.get(counterRef); if (!counterDoc.exists) throw `El contador '${counter}' no existe.`; newNumber = counterDoc.data().currentNumber + 1; transaction.update(counterRef, { currentNumber: newNumber }); newId = `${prefix}${newNumber}`; }); data.numericId = newNumber; await db.collection(collectionName).doc(newId).set(data); if (type === 'credentials' && category === 'software' && data.assignedTo) { await db.collection('inventory').doc(data.assignedTo).update({ os: newId }); } if (type === 'inventory' && category === 'computers' && data.os) { await db.collection('credentials').doc(data.os).update({ assignedTo: newId }); } } else { if (type === 'maintenance') data.status = 'planificada'; await db.collection(collectionName).add(data); } } formModal.classList.add('hidden'); } catch (error) { console.error("Error al guardar:", error); alert("Hubo un error al guardar."); } }); } catch (error) { console.error("Error al mostrar el formulario modal:", error); alert(`No se pudo abrir el formulario.\n\nError: ${error.message}`); } }
    
    function showEventActionChoiceModal(eventId, eventTitle, eventProps) { const actionModal = document.getElementById('action-modal'); const modalBody = actionModal.querySelector('#action-modal-body'); let completedInfo = ''; if (eventProps.status === 'completada') { completedInfo = `<hr><h4>Información de Finalización</h4><p><strong>Fecha:</strong> ${new Date(eventProps.completedDate + 'T00:00:00').toLocaleDateString('es-ES')}</p><p><strong>A tiempo:</strong> ${eventProps.onTimeStatus}</p><p><strong>Observaciones:</strong> ${eventProps.completionNotes || 'N/A'}</p>`; } const actionButtons = eventProps.status === 'planificada' ? `<div style="display: flex; justify-content: space-around; flex-wrap: wrap; gap: 10px; margin-top: 20px;"><button class="primary" id="edit-task-btn" style="background-color: #ffc107; color: #212529;">✏️ Editar Tarea</button><button class="primary" id="finalize-task-btn">✅ Finalizar Tarea</button><button class="danger" id="delete-task-btn">🗑️ Eliminar</button></div>` : ''; modalBody.innerHTML = `<h2>${eventTitle}</h2><p><strong>Estado:</strong> ${eventProps.status}</p>${completedInfo}${actionButtons}`; actionModal.classList.remove('hidden'); if (eventProps.status === 'planificada') { document.getElementById('edit-task-btn').onclick = () => { actionModal.classList.add('hidden'); showItemFormModal('maintenance', null, eventId); }; document.getElementById('finalize-task-btn').onclick = () => { actionModal.classList.add('hidden'); showFinalizeTaskModal(eventId, eventTitle); }; document.getElementById('delete-task-btn').onclick = () => { if (confirm(`¿Estás seguro de que quieres ELIMINAR permanentemente la tarea "${eventTitle}"? Esta acción no se puede deshacer.`)) { db.collection('maintenance').doc(eventId).delete().then(() => { actionModal.classList.add('hidden'); }).catch(error => { console.error("Error al eliminar la tarea: ", error); alert("No se pudo eliminar la tarea."); }); } }; } }
    function showFinalizeTaskModal(eventId, eventTitle) { const actionModal = document.getElementById('action-modal'); const modalBody = actionModal.querySelector('#action-modal-body'); const today = new Date().toISOString().split('T')[0]; modalBody.innerHTML = `<h2>Finalizar Tarea: "${eventTitle}"</h2><form id="finalize-form"><div class="form-group"><label for="completedDate">Fecha de Realización</label><input type="date" id="completedDate" name="completedDate" value="${today}" required></div><div class="form-group"><label for="onTimeStatus">¿Se realizó a tiempo?</label><select id="onTimeStatus" name="onTimeStatus"><option value="Sí">Sí</option><option value="No">No</option></select></div><div class="form-group"><label>Observaciones (opcional)</label><textarea name="completionNotes" rows="3"></textarea></div><div style="text-align: right; margin-top: 20px;"><button type="submit" class="primary">Guardar Finalización</button></div></form>`; actionModal.classList.remove('hidden'); document.getElementById('finalize-form').addEventListener('submit', async (e) => { e.preventDefault(); const form = e.target; form.querySelector('button[type="submit"]').disabled = true; try { const updateData = { status: 'completada', completedDate: form.completedDate.value, onTimeStatus: form.onTimeStatus.value, completionNotes: form.completionNotes.value }; await db.collection('maintenance').doc(eventId).set(updateData, { merge: true }); actionModal.classList.add('hidden'); } catch (error) { console.error("Error al finalizar la tarea: ", error); alert("Hubo un error al finalizar la tarea. Revisa la consola para más detalles."); form.querySelector('button[type="submit"]').disabled = false; } }); }
    function showCancelTaskModal(eventId, eventTitle) { const actionModal = document.getElementById('action-modal'); const modalBody = actionModal.querySelector('#action-modal-body'); modalBody.innerHTML = `<h2>Cancelar Tarea: "${eventTitle}"</h2><form id="cancel-form"><div class="form-group"><label for="cancellationReason">Razón de la Cancelación</label><textarea id="cancellationReason" name="cancellationReason" rows="4" required></textarea></div><div style="text-align: right; margin-top: 20px;"><button type="submit" class="danger">Confirmar Cancelación</button></div></form>`; actionModal.classList.remove('hidden'); document.getElementById('cancel-form').addEventListener('submit', e => { e.preventDefault(); const reason = e.target.cancellationReason.value; db.collection('maintenance').doc(eventId).update({ status: 'cancelada', cancellationReason: reason }).then(() => actionModal.classList.add('hidden')); }); }
    
    async function showEditClosedAtModal(ticketId, currentClosedAt) { const actionModal = document.getElementById('action-modal'); const modalBody = actionModal.querySelector('#action-modal-body'); const closedAtValue = currentClosedAt ? currentClosedAt.toDate().toISOString().split('T')[0] : ''; modalBody.innerHTML = `<h2>Editar Fecha de Cierre del Ticket ${ticketId}</h2><form id="edit-closed-at-form"><div class="form-group"><label for="closedAtDate">Fecha de Cierre</label><input type="date" id="closedAtDate" name="closedAtDate" value="${closedAtValue}"></div><div style="text-align: right; margin-top: 20px;"><button type="submit" class="primary">Guardar Fecha</button><button type="button" class="btn-secondary modal-close-btn" style="margin-left: 10px;">Cancelar</button></div></form>`; actionModal.classList.remove('hidden'); document.getElementById('edit-closed-at-form').addEventListener('submit', async (e) => { e.preventDefault(); const form = e.target; const newClosedAtDate = form.closedAtDate.value; try { if (newClosedAtDate) { const newClosedAtTimestamp = firebase.firestore.Timestamp.fromDate(new Date(newClosedAtDate + 'T00:00:00')); await db.collection('tickets').doc(ticketId).update({ closedAt: newClosedAtTimestamp }); } else { await db.collection('tickets').doc(ticketId).update({ closedAt: null }); } actionModal.classList.add('hidden'); showTicketModal(ticketId); } catch (error) { console.error("Error al actualizar la fecha de cierre:", error); alert("No se pudo actualizar la fecha de cierre. Revisa la consola."); } }); }
    
    async function showTicketModal(ticketId) { const ticketModal = document.getElementById('ticket-modal'); const modalBody = ticketModal.querySelector('#modal-body'); ticketModal.classList.remove('hidden'); modalBody.innerHTML = '<p>Cargando detalles del ticket...</p>'; const ticketDoc = await db.collection('tickets').doc(ticketId).get(); if (!ticketDoc.exists) { alert('Error: No se encontró el ticket.'); ticketModal.classList.add('hidden'); return; } const ticket = { id: ticketDoc.id, ...ticketDoc.data() }; const requesterName = ticket.requesterId ? (await db.collection('requesters').doc(ticket.requesterId).get()).data()?.name || ticket.requesterId : 'N/A';
                                              const isQuickNote = ticket.ticketType === 'nota' || ticket.recordType === 'nota_rapida';

if (isQuickNote) {
    let historyItemsHTML = '';

    if (ticket.history && ticket.history.length > 0) {
        const orderedHistory = [...ticket.history].sort((a, b) => b.timestamp.toMillis() - a.timestamp.toMillis());

        historyItemsHTML = orderedHistory.map((entry, index) => `
            <div class="provider-history-item ${index === 0 ? 'latest' : ''}">
                <div class="provider-history-line">
                    <span class="provider-history-dot note"></span>
                    ${index !== orderedHistory.length - 1 ? '<span class="provider-history-stick"></span>' : ''}
                </div>
                <div class="provider-history-content">
                    <div class="provider-history-meta">
                        <span>${entry.timestamp.toDate().toLocaleString('es-ES')}</span>
                        ${index === 0 ? '<span class="provider-history-badge note">ÚLTIMA NOTA</span>' : ''}
                    </div>
                    <div class="provider-history-text">${entry.text}</div>
                </div>
            </div>
        `).join('');
    } else {
        historyItemsHTML = `<div class="provider-history-empty">Aún no hay historial para esta nota.</div>`;
    }

    modalBody.innerHTML = `
        <div class="provider-ticket-modal note-detail-modal">

            <div class="provider-ticket-top">
                <div class="provider-ticket-head-left">
                    <div class="provider-ticket-icon note">📝</div>
                    <div>
                        <span class="provider-case-badge note">NOTA RÁPIDA</span>
                        <h2>${ticket.id}</h2>
                        <p>${ticket.supportType ? ticket.supportType.toUpperCase() : 'Pendiente por completar'}</p>
                    </div>
                </div>

                <div class="provider-ticket-head-right">
                    <span class="provider-status-pill note">PENDIENTE</span>
                </div>
            </div>

            <div class="provider-ticket-layout">
                <div class="provider-ticket-left">

                    <div class="provider-panel">
                        <div class="provider-panel-title">Nota registrada</div>
                        <div class="note-description-box">
                            ${ticket.description || 'Sin nota registrada.'}
                        </div>
                    </div>

                    <div class="provider-panel">
                        <div class="provider-panel-title">Historial</div>
                        <div class="provider-history-list">
                            ${historyItemsHTML}
                        </div>
                        <div class="provider-history-note">
                            Esta nota queda pendiente para convertirla después en soporte completo.
                        </div>
                    </div>

                </div>

                <div class="provider-ticket-right">

                    <div class="provider-action-card">
                        <div class="provider-action-card-header">
                            <div class="provider-action-icon blue">💬</div>
                            <div>
                                <h4>Añadir comentario</h4>
                                <p>Agrega más información si recordaste algo nuevo.</p>
                            </div>
                        </div>

                        <form id="quick-note-progress-form">
                            <div class="form-group">
                                <textarea id="quick-note-progress-text" rows="5" placeholder="Escribe un comentario adicional..." required></textarea>
                            </div>
                            <button type="submit" class="provider-progress-btn">Guardar comentario</button>
                        </form>
                    </div>

                    <div class="provider-action-card">
    <div class="provider-action-card-header">
        <div class="provider-action-icon green">✓</div>
        <div>
            <h4>Convertir en soporte</h4>
            <p>Elige a qué tipo de soporte quieres llevar esta nota.</p>
        </div>
    </div>

    <form id="convert-note-form">
        <div class="form-group">
            <label for="convert-note-type">Convertir a</label>
            <select id="convert-note-type" required>
                <option value="ti">Soporte TI</option>
                <option value="velocity">Velocity</option>
                <option value="siigo">Siigo</option>
            </select>
        </div>

        <button type="submit" class="provider-close-btn">Convertir nota</button>
    </form>
</div>

                </div>
            </div>
        </div>
    `;
    document.getElementById('convert-note-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const convertType = document.getElementById('convert-note-type').value;

    const noteToConvert = {
        noteId: ticket.id,
        text: ticket.description || '',
        requesterId: ticket.requesterId || '',
        supportType: convertType
    };

    sessionStorage.setItem('quickNoteToConvert', JSON.stringify(noteToConvert));

    if (convertType === 'ti') {
        window.location.hash = '#crear-ticket-ti';
    } else if (convertType === 'velocity') {
        window.location.hash = '#crear-ticket-velocity';
    } else if (convertType === 'siigo') {
        window.location.hash = '#crear-ticket-siigo';
    }

    ticketModal.classList.add('hidden');
});
    document.getElementById('quick-note-progress-form').addEventListener('submit', async (e) => {
        e.preventDefault();

        const text = document.getElementById('quick-note-progress-text').value.trim();
        if (!text) return;

        const newHistoryEntry = {
            text: text,
            timestamp: firebase.firestore.Timestamp.fromDate(new Date())
        };

        await db.collection('tickets').doc(ticket.id).update({
            history: firebase.firestore.FieldValue.arrayUnion(newHistoryEntry)
        });

        showTicketModal(ticket.id);
    });

    return;
}
                                              const isProviderCase = ticket.ticketType === 'velocity' || ticket.ticketType === 'siigo';

if (isProviderCase) {
    const caseBadge = ticket.ticketType === 'velocity' ? 'CASO VELOCITY' : 'CASO SIIGO';
    const providerLabel = ticket.ticketType === 'velocity' ? 'Velocity' : 'Siigo';
    const currentStatus = ticket.status === 'cerrado' ? 'CERRADO' : 'EN CURSO';

    let historyItemsHTML = '';

    if (ticket.history && ticket.history.length > 0) {
        const orderedHistory = [...ticket.history].sort((a, b) => b.timestamp.toMillis() - a.timestamp.toMillis());

        historyItemsHTML = orderedHistory.map((entry, index) => `
            <div class="provider-history-item ${index === 0 ? 'latest' : ''}">
                <div class="provider-history-line">
                    <span class="provider-history-dot"></span>
                    ${index !== orderedHistory.length - 1 ? '<span class="provider-history-stick"></span>' : ''}
                </div>
                <div class="provider-history-content">
                    <div class="provider-history-meta">
                        <span>${entry.timestamp.toDate().toLocaleString('es-ES')}</span>
                        ${index === 0 ? '<span class="provider-history-badge">ÚLTIMO AVANCE</span>' : ''}
                    </div>
                    <div class="provider-history-text">${entry.text}</div>
                </div>
            </div>
        `).join('');
    } else {
        historyItemsHTML = `
            <div class="provider-history-empty">
                Aún no hay más avances registrados en este caso.
            </div>
        `;
    }

    const closeSectionHTML = ticket.status !== 'cerrado'
        ? `
            <div class="provider-action-card provider-close-card">
                <div class="provider-action-card-header">
                    <div class="provider-action-icon green">✓</div>
                    <div>
                        <h4>Cerrar caso con solución final</h4>
                        <p>Registra la solución final aplicada y cierra el caso.</p>
                    </div>
                </div>
                <form id="solution-form">
                    <div class="form-group">
                        <div id="solution-editor"></div>
                    </div>
                    <button type="submit" class="provider-close-btn">Cerrar caso</button>
                </form>
            </div>
        `
        : `
            <div class="provider-action-card provider-close-card">
                <div class="provider-action-card-header">
                    <div class="provider-action-icon green">✓</div>
                    <div>
                        <h4>Solución final</h4>
                        <p>Este caso ya fue cerrado.</p>
                    </div>
                </div>
                <div class="provider-solution-view">
                    ${ticket.solution || 'No se registró solución final.'}
                </div>
            </div>
        `;

    modalBody.innerHTML = `
        <div class="provider-ticket-modal">
            <div class="provider-ticket-top">
                <div class="provider-ticket-head-left">
                    <div class="provider-ticket-icon">🏷</div>
                    <div>
                        <span class="provider-case-badge">${caseBadge}</span>
                        <h2>${ticket.id}</h2>
                        <p>${ticket.description || ticket.descripcionDeLaNovedad || ticket.title || 'Sin descripción'}</p>
                    </div>
                </div>

                <div class="provider-ticket-head-right">
                    <span class="provider-status-pill ${ticket.status === 'cerrado' ? 'closed' : 'progress'}">${currentStatus}</span>
                    <span class="provider-platform-pill">${providerLabel}</span>
                </div>
            </div>

            <div class="provider-ticket-layout">
                <div class="provider-ticket-left">

                    <div class="provider-panel">
                        <div class="provider-panel-title">Información del reporte</div>
                        <div class="provider-info-grid">
                            <div class="provider-info-item">
                                <span>Fecha de reporte</span>
                                <strong>${ticket.fechaDeReporte || 'N/A'}</strong>
                            </div>
                            <div class="provider-info-item">
                                <span>Hora de reporte</span>
                                <strong>${ticket.horaDeReporte || 'N/A'}</strong>
                            </div>
                            <div class="provider-info-item">
                                <span>Medio de solicitud</span>
                                <strong>${ticket.medioDeSolicitud || 'N/A'}</strong>
                            </div>
                            <div class="provider-info-item">
                                <span>Asesor / canal</span>
                                <strong>${ticket.asesorDeSoporte || 'N/A'}</strong>
                            </div>
                            <div class="provider-info-item">
                                <span>Caso externo</span>
                                <strong>${ticket.ticketDelCaso || 'N/A'}</strong>
                            </div>
                        </div>
                    </div>

                    <div class="provider-panel">
                        <div class="provider-panel-title">Historial de avances</div>
                        <div class="provider-history-list">
                            ${historyItemsHTML}
                        </div>
                        <div class="provider-history-note">
                            Los avances se muestran en orden cronológico, del más reciente al más antiguo.
                        </div>
                    </div>

                </div>

                <div class="provider-ticket-right">

                    ${ticket.status !== 'cerrado' ? `
                        <div class="provider-action-card">
                            <div class="provider-action-card-header">
                                <div class="provider-action-icon blue">💬</div>
                                <div>
                                    <h4>Añadir avance</h4>
                                    <p>Registra una actualización del estado del caso.</p>
                                </div>
                            </div>
                            <form id="progress-form">
                                <div class="form-group">
                                    <textarea id="progress-text" rows="5" placeholder="Describe el avance realizado..." required></textarea>
                                </div>
                                <button type="submit" class="provider-progress-btn">Guardar avance y poner “EN CURSO”</button>
                            </form>
                        </div>
                    ` : ''}

                    ${closeSectionHTML}

                </div>
            </div>
        </div>
    `;
    
    if (ticket.status !== 'cerrado') {
        document.getElementById('progress-form').addEventListener('submit', async (e) => {
            e.preventDefault();

            const text = document.getElementById('progress-text').value.trim();
            if (!text) return;

            const newHistoryEntry = {
                text: text,
                timestamp: firebase.firestore.Timestamp.fromDate(new Date())
            };

            await db.collection('tickets').doc(ticket.id).update({
                status: 'en-curso',
                history: firebase.firestore.FieldValue.arrayUnion(newHistoryEntry)
            });

            showTicketModal(ticket.id);
        });

        const solutionEditor = new Quill('#solution-editor', {
            theme: 'snow',
            placeholder: 'Describe la solución final aplicada...'
        });

        document.getElementById('solution-form').addEventListener('submit', async (e) => {
            e.preventDefault();

            const finalSolution = solutionEditor.root.innerHTML;
            if (!finalSolution || finalSolution === '<p><br></p>') return;

            const closeHistoryEntry = {
                text: `<strong>Caso cerrado.</strong><br>Se registró solución final.`,
                timestamp: firebase.firestore.Timestamp.fromDate(new Date())
            };

            await db.collection('tickets').doc(ticket.id).update({
                solution: finalSolution,
                status: 'cerrado',
                closedAt: firebase.firestore.FieldValue.serverTimestamp(),
                history: firebase.firestore.FieldValue.arrayUnion(closeHistoryEntry)
            });

            showTicketModal(ticket.id);
        });
    }

    return;
}
let devicesHTML = ''; if (ticket.deviceIds && ticket.deviceIds.length > 0) { devicesHTML = `<div class="ticket-detail-item"><strong>Dispositivos:</strong><ul style="margin-top: 5px; padding-left: 20px;">${ticket.deviceIds.map(id => `<li>${id}</li>`).join('')}</ul></div>`; } let mainContentHTML = ''; if (ticket.ticketType === 'velocity' || ticket.ticketType === 'siigo') { mainContentHTML = `<h4>Detalles del Reporte</h4><div class="ticket-details-grid"><div><strong>Fecha de Reporte:</strong> ${ticket.fechaDeReporte || 'N/A'}</div><div><strong>Hora de Reporte:</strong> ${ticket.horaDeReporte || 'N/A'}</div><div><strong>Medio de Solicitud:</strong> ${ticket.medioDeSolicitud || 'N/A'}</div><div><strong>Asesor de Soporte:</strong> ${ticket.asesorDeSoporte || 'N/A'}</div><div><strong>Ticket del Caso:</strong> ${ticket.ticketDelCaso || 'N/A'}</div></div><hr><h4>Descripción de la Novedad</h4><div class="card">${ticket.descripcionDeLaNovedad}</div>`; } else { mainContentHTML = `<h3>Descripción</h3><div class="card">${ticket.description}</div>`; } let historyHTML = '<h3>Historial de Avances</h3>'; if (ticket.history && ticket.history.length > 0) { historyHTML += '<ul class="ticket-history-log">'; ticket.history.sort((a, b) => b.timestamp.toMillis() - a.timestamp.toMillis()); ticket.history.forEach(entry => { historyHTML += `<li><div class="history-meta">Registrado el: ${entry.timestamp.toDate().toLocaleString('es-ES')}</div><div class="history-text">${entry.text}</div></li>`; }); historyHTML += '</ul>'; } else { historyHTML += '<p>No hay avances registrados.</p>'; } let actionsHTML = ''; if (ticket.status === 'abierto' || ticket.status === 'en-curso') { actionsHTML = `<hr><h3>Añadir Avance</h3><form id="progress-form"><div class="form-group"><textarea id="progress-text" rows="3" placeholder="Describe el avance realizado..." required></textarea></div><button type="submit" class="btn-warning">Guardar Avance y Poner "En Curso"</button></form><hr><h3>Añadir Solución Final y Cerrar Ticket</h3><form id="solution-form"><div class="form-group"><div id="solution-editor"></div></div><button type="submit" class="primary">Guardar Solución y Cerrar</button></form>`; } else if (ticket.status === 'cerrado') { actionsHTML = `<hr><h3>Solución Aplicada</h3><div class="card">${ticket.solution || 'No se especificó solución.'}</div>`; if (ticket.solution) { actionsHTML += `<div style="text-align: right; margin-top: 15px;"><button id="create-kb-from-ticket-btn" class="btn-blue">📝 Crear Artículo de Conocimiento</button></div>`; } } let modalActions = `<div class="ticket-modal-actions">`; if ((ticket.status === 'abierto' || ticket.status === 'en-curso') && ticket.ticketType === 'ti') { modalActions += `<button id="edit-ticket-btn" class="btn-secondary">✏️ Editar Ticket</button>`; } if (ticket.status === 'cerrado') { modalActions += `<button id="reopen-ticket-btn" class="btn-warning">↩️ Reabrir Ticket</button>`; } if (ticket.closedAt) { modalActions += `<button id="edit-closed-at-date-btn" class="btn-secondary" style="margin-left:10px;">🗓️ Editar Fecha Cierre</button>`; } modalActions += `</div>`; modalBody.innerHTML = `<div class="ticket-modal-layout"><div class="ticket-modal-main"><h2>Ticket ${ticket.id} (${capitalizar(ticket.ticketType || 'TI')})</h2>${modalActions}<hr>${mainContentHTML}${historyHTML}${actionsHTML}</div><div class="ticket-modal-sidebar"><h3>Detalles del Ticket</h3><div class="ticket-detail-item"><strong>Estado:</strong> <span class="status status-${ticket.status}">${capitalizar(ticket.status.replace('-', ' '))}</span></div>${ticket.priority ? `<div class="ticket-detail-item"><strong>Prioridad:</strong> ${capitalizar(ticket.priority)}</div>` : ''}<div class="ticket-detail-item"><strong>Solicitante:</strong> ${requesterName}</div>${ticket.locationId ? `<div class="ticket-detail-item"><strong>Ubicación:</strong> ${ticket.locationId}</div>` : ''}<div class="ticket-detail-item"><strong>Creado:</strong> ${ticket.createdAt.toDate().toLocaleString('es-ES')}</div>${ticket.closedAt ? `<div class="ticket-detail-item"><strong>Cerrado:</strong> ${ticket.closedAt.toDate().toLocaleString('es-ES')}</div>` : ''}${devicesHTML}</div></div>`; if ((ticket.status === 'abierto' || ticket.status === 'en-curso') && ticket.ticketType === 'ti') { document.getElementById('edit-ticket-btn').addEventListener('click', () => { ticketModal.classList.add('hidden'); showEditTicketModal(ticket.id); }); } if (document.getElementById('edit-closed-at-date-btn')) { document.getElementById('edit-closed-at-date-btn').addEventListener('click', () => { ticketModal.classList.add('hidden'); showEditClosedAtModal(ticket.id, ticket.closedAt); }); } if (ticket.status === 'abierto' || ticket.status === 'en-curso') { document.getElementById('progress-form').addEventListener('submit', async (e) => { e.preventDefault(); const text = document.getElementById('progress-text').value; if (!text.trim()) return; const newHistoryEntry = { text: text, timestamp: firebase.firestore.FieldValue.serverTimestamp() }; await db.collection('tickets').doc(ticket.id).update({ status: 'en-curso', history: firebase.firestore.FieldValue.arrayUnion(newHistoryEntry) }); showTicketModal(ticket.id); }); const solutionEditor = new Quill('#solution-editor', { theme: 'snow', placeholder: 'Describe la solución final aplicada...' }); document.getElementById('solution-form').addEventListener('submit', e => { e.preventDefault(); db.collection('tickets').doc(ticket.id).update({ solution: solutionEditor.root.innerHTML, status: 'cerrado', closedAt: firebase.firestore.FieldValue.serverTimestamp() }).then(() => showTicketModal(ticket.id)); }); } if (ticket.status === 'cerrado') { document.getElementById('reopen-ticket-btn').addEventListener('click', async () => { if (confirm('¿Estás seguro de que quieres reabrir este ticket?')) { const reopeningHistoryEntry = { text: `<strong>Ticket reabierto</strong> por el usuario.`, timestamp: firebase.firestore.Timestamp.fromDate(new Date()) }; try { await db.collection('tickets').doc(ticket.id).update({ status: 'abierto', closedAt: null, solution: null, history: firebase.firestore.FieldValue.arrayUnion(reopeningHistoryEntry) }); showTicketModal(ticket.id); } catch (error) { console.error("Error al reabrir el ticket:", error); alert("No se pudo reabrir el ticket."); } } }); const createKbBtn = document.getElementById('create-kb-from-ticket-btn'); if (createKbBtn) { createKbBtn.addEventListener('click', () => { const prefillData = { title: ticket.title, problem: ticket.description, solution: ticket.solution, type: 'article' }; ticketModal.classList.add('hidden'); showKnowledgeBaseFormModal(null, prefillData); }); } } }
    
    async function renderKnowledgeBase(container) {
    container.innerHTML = knowledgeBaseHTML;

    const gridContainer = document.getElementById('kb-grid-container');
    const searchInput = document.getElementById('kb-search-input');
    const resultsInfo = document.getElementById('kb-results-info');
    const paginationText = document.getElementById('kb-pagination-text');
    const chips = document.querySelectorAll('.kb-chip');

    let articles = [];
    let activeCategory = '';

    function stripHtml(html) {
        const div = document.createElement('div');
        div.innerHTML = html || '';
        return div.textContent || div.innerText || '';
    }

    function getArticleType(article) {
        return article.type === 'manual' ? 'Manual' : 'Artículo';
    }

    function getShortDescription(article) {
        const problem = stripHtml(article.problem);
        const solution = stripHtml(article.solution);
        const baseText = problem || solution || 'Sin descripción registrada.';

        return baseText.length > 120 ? baseText.substring(0, 120) + '...' : baseText;
    }

    function getUpdatedDate(article) {
        const date = article.updatedAt?.toDate?.() || article.createdAt?.toDate?.();

        if (!date) return 'Sin fecha';

        return date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    }

    function getCategoryIcon(category, type) {
        const cleanCategory = (category || '').toLowerCase();

        if (type === 'manual') return '📘';
        if (cleanCategory.includes('red')) return '☍';
        if (cleanCategory.includes('impres')) return '▣';
        if (cleanCategory.includes('velocity')) return 'Ⅴ';
        if (cleanCategory.includes('siigo')) return '$';
        if (cleanCategory.includes('cam')) return '▣';
        if (cleanCategory.includes('dispositivo')) return '▯';
        if (cleanCategory.includes('equipo')) return '▭';

        return '📄';
    }

    function matchesCategory(article) {
        if (!activeCategory) return true;

        if (activeCategory === 'Manual') {
            return article.type === 'manual';
        }

        if (activeCategory === 'Artículo') {
            return article.type !== 'manual';
        }

        return (article.category || '').toLowerCase() === activeCategory.toLowerCase();
    }

    function displayArticles() {
        const searchTerm = searchInput.value.trim().toLowerCase();

        const filteredArticles = articles.filter(article => {
            const text = [
                article.title,
                article.category,
                article.problem,
                article.solution,
                article.type
            ].join(' ').toLowerCase();

            return text.includes(searchTerm) && matchesCategory(article);
        });

        if (filteredArticles.length === 0) {
            gridContainer.innerHTML = `
                <div class="kb-empty-state">
                    No se encontraron artículos con esos filtros.
                </div>
            `;

            resultsInfo.textContent = 'Sin resultados';
            paginationText.textContent = 'Mostrando 0 artículos';
            return;
        }

        resultsInfo.textContent = searchTerm
            ? `Se encontraron ${filteredArticles.length} resultados para “${searchInput.value}”`
            : `Mostrando ${filteredArticles.length} artículos`;

        paginationText.textContent = `Mostrando 1 a ${filteredArticles.length} de ${articles.length} artículos`;

        gridContainer.innerHTML = filteredArticles.map(article => {
            const category = article.category || getArticleType(article);
            const type = getArticleType(article);
            const icon = getCategoryIcon(category, article.type);
            const description = getShortDescription(article);

            return `
                <article class="kb-modern-card" data-id="${article.id}">
                    <div class="kb-card-icon">${icon}</div>

                    <div class="kb-card-content">
                        <span class="kb-card-category">${category}</span>
                        <h3>${article.title || 'Sin título'}</h3>
                        <p>${description}</p>

                        <div class="kb-card-footer">
                            <span>📅 Actualizado: ${getUpdatedDate(article)}</span>
                            <button type="button" class="kb-view-detail" data-id="${article.id}">
                                Ver detalle →
                            </button>
                        </div>
                    </div>
                </article>
            `;
        }).join('');

        document.querySelectorAll('.kb-modern-card, .kb-view-detail').forEach(element => {
            element.addEventListener('click', (event) => {
                event.stopPropagation();
                const articleId = element.dataset.id;
                showKnowledgeBaseArticleModal(articleId);
            });
        });
    }

    try {
        const snapshot = await db.collection('knowledge_base').orderBy('updatedAt', 'desc').get();

        articles = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        displayArticles();

    } catch (error) {
        console.error('Error cargando base de conocimiento:', error);
        gridContainer.innerHTML = `
            <div class="kb-empty-state">
                No se pudo cargar la base de conocimiento.
            </div>
        `;
    }

    searchInput.addEventListener('input', displayArticles);

    chips.forEach(chip => {
        chip.addEventListener('click', () => {
            chips.forEach(item => item.classList.remove('active'));
            chip.classList.add('active');
            activeCategory = chip.dataset.category || '';
            displayArticles();
        });
    });

    document.getElementById('add-kb-article-btn').addEventListener('click', () => {
        showKnowledgeBaseFormModal();
    });

    document.getElementById('add-manual-btn').addEventListener('click', () => {
        showManualFormModal();
    });
}
    async function showKnowledgeBaseFormModal(docId = null, prefillData = {}) { const formModal = document.getElementById('form-modal'); const modalBody = formModal.querySelector('#form-modal-body'); const isEditing = docId !== null; let existingData = {}; if (isEditing) { const docSnap = await db.collection('knowledge_base').doc(docId).get(); if (docSnap.exists) { existingData = docSnap.data(); } } else { existingData = prefillData; } const { title = '', category = '', problem = '', solution = '' } = existingData; modalBody.innerHTML = `<h2>${isEditing ? 'Editar' : 'Crear'} Artículo de Conocimiento</h2><form id="kb-form"><div class="form-group"><label for="kb-title">Título</label><input type="text" id="kb-title" value="${title}" required></div><div class="form-group"><label for="kb-category">Categoría</label><select id="kb-category" required><option value="" ${!category ? 'selected' : ''} disabled>Selecciona una categoría</option><option value="Redes" ${category === 'Redes' ? 'selected' : ''}>Redes</option><option value="Dispositivos" ${category === 'Dispositivos' ? 'selected' : ''}>Dispositivos</option><option value="Bases de Datos" ${category === 'Bases de Datos' ? 'selected' : ''}>Bases de Datos</option><option value="Programas" ${category === 'Programas' ? 'selected' : ''}>Programas</option></select></div><div class="form-group"><label>Descripción del Problema/Síntoma</label><div id="kb-problem-editor" style="height: 150px;"></div></div><div class="form-group"><label>Solución Paso a Paso</label><div id="kb-solution-editor" style="height: 250px;"></div></div><div style="text-align: right; margin-top: 20px;"><button type="submit" class="primary">${isEditing ? 'Guardar Cambios' : 'Guardar Artículo'}</button></div></form>`; const problemEditor = new Quill('#kb-problem-editor', { theme: 'snow' }); problemEditor.root.innerHTML = problem; const solutionEditor = new Quill('#kb-solution-editor', { theme: 'snow' }); solutionEditor.root.innerHTML = solution; formModal.classList.remove('hidden'); document.getElementById('kb-form').addEventListener('submit', async (e) => { e.preventDefault(); const formData = { title: document.getElementById('kb-title').value, category: document.getElementById('kb-category').value, problem: problemEditor.root.innerHTML, solution: solutionEditor.root.innerHTML, updatedAt: firebase.firestore.FieldValue.serverTimestamp(), type: 'article' }; try { if (isEditing) { await db.collection('knowledge_base').doc(docId).update(formData); } else { formData.createdAt = firebase.firestore.FieldValue.serverTimestamp(); await db.collection('knowledge_base').add(formData); } formModal.classList.add('hidden'); if (window.location.hash === '#knowledge-base') { renderKnowledgeBase(document.getElementById('app-content')); } } catch (error) { console.error("Error guardando artículo:", error); alert("No se pudo guardar el artículo."); } }); }
    async function showManualFormModal(docId = null) { const formModal = document.getElementById('form-modal'); const modalBody = formModal.querySelector('#form-modal-body'); const isEditing = docId !== null; let existingData = {}; if (isEditing) { const docSnap = await db.collection('knowledge_base').doc(docId).get(); if (docSnap.exists) { existingData = docSnap.data(); } } const { title = '', category = '', solution = '' } = existingData; modalBody.innerHTML = `<h2>${isEditing ? 'Editar' : 'Crear'} Manual</h2><form id="manual-form"><div class="form-group"><label for="manual-title">Título del Manual</label><input type="text" id="manual-title" value="${title}" required></div><div class="form-group"><label for="manual-category">Categoría</label><select id="manual-category" required><option value="" ${!category ? 'selected' : ''} disabled>Selecciona una categoría</option><option value="Redes" ${category === 'Redes' ? 'selected' : ''}>Redes</option><option value="Dispositivos" ${category === 'Dispositivos' ? 'selected' : ''}>Dispositivos</option><option value="Bases de Datos" ${category === 'Bases de Datos' ? 'selected' : ''}>Bases de Datos</option><option value="Programas" ${category === 'Programas' ? 'selected' : ''}>Programas</option></select></div><div class="form-group"><label>Paso a Paso</label><div id="manual-solution-editor" style="height: 400px;"></div></div><div style="text-align: right; margin-top: 20px;"><button type="submit" class="primary">${isEditing ? 'Guardar Cambios' : 'Guardar Manual'}</button></div></form>`; const solutionEditor = new Quill('#manual-solution-editor', { theme: 'snow' }); solutionEditor.root.innerHTML = solution; formModal.classList.remove('hidden'); document.getElementById('manual-form').addEventListener('submit', async (e) => { e.preventDefault(); const formData = { title: document.getElementById('manual-title').value, category: document.getElementById('manual-category').value, solution: solutionEditor.root.innerHTML, problem: '', updatedAt: firebase.firestore.FieldValue.serverTimestamp(), type: 'manual' }; try { if (isEditing) { await db.collection('knowledge_base').doc(docId).update(formData); } else { formData.createdAt = firebase.firestore.FieldValue.serverTimestamp(); await db.collection('knowledge_base').add(formData); } formModal.classList.add('hidden'); if (window.location.hash === '#knowledge-base') { renderKnowledgeBase(document.getElementById('app-content')); } } catch (error) { console.error("Error guardando manual:", error); alert("No se pudo guardar el manual."); } }); }
    async function showKnowledgeBaseArticleModal(docId) { const actionModal = document.getElementById('action-modal'); const modalBody = actionModal.querySelector('#action-modal-body'); actionModal.classList.remove('hidden'); modalBody.innerHTML = '<p>Cargando...</p>'; try { const docSnap = await db.collection('knowledge_base').doc(docId).get(); if (!docSnap.exists) { modalBody.innerHTML = '<p>Error: No encontrado.</p>'; return; } const article = docSnap.data(); const isManual = article.type === 'manual'; let contentHTML = ''; if (isManual) { contentHTML = `<h3>Paso a Paso</h3><div class="card">${article.solution}</div>`; } else { contentHTML = `<h3>Problema</h3><div class="card">${article.problem}</div><h3>Solución</h3><div class="card">${article.solution}</div>`; } modalBody.innerHTML = `<h2>${article.title}</h2><p><span class="kb-category">${article.category}</span></p><div class="kb-article-content">${contentHTML}</div><div style="text-align: right; margin-top: 20px; display: flex; gap: 10px; justify-content: flex-end;"><button id="edit-kb-btn" class="btn-secondary">✏️ Editar</button><button id="delete-kb-btn" class="danger">🗑️ Eliminar</button></div>`; document.getElementById('edit-kb-btn').addEventListener('click', () => { actionModal.classList.add('hidden'); if (isManual) { showManualFormModal(docId); } else { showKnowledgeBaseFormModal(docId); } }); document.getElementById('delete-kb-btn').addEventListener('click', async () => { if (confirm(`¿Estás seguro de que quieres eliminar est${isManual ? 'e manual' : 'e artículo'}?`)) { await db.collection('knowledge_base').doc(docId).delete(); actionModal.classList.add('hidden'); renderKnowledgeBase(document.getElementById('app-content')); } }); } catch (error) { console.error("Error cargando:", error); modalBody.innerHTML = '<p>Error al cargar.</p>'; } }

    // --- 6. PUNTO DE ENTRADA AL MÓDULO Y HERENCIA DE SESIÓN ---
    function iniciarAppGLPI() {
        const appContainer = document.getElementById('app-container');
        const loginContainer = document.getElementById('login-container');
        const appContent = document.getElementById('app-content');
        
        if (loginContainer) loginContainer.style.display = 'none';
        if (appContainer) appContainer.classList.remove('hidden');

        const routes = {
            '#dashboard': renderDashboard,
            '#crear-ticket-ti': renderNewTITicketForm,
            '#crear-ticket-velocity': c => renderNewPlatformTicketForm(c, 'Velocity'),
            '#crear-ticket-siigo': c => renderNewPlatformTicketForm(c, 'Siigo'),
            '#nota-rapida': renderQuickNote,
            '#soportes-atrasados': renderBacklogSupports,
            '#tickets': renderTicketList, '#historial': renderHistoryPage,
            '#knowledge-base': renderKnowledgeBase, '#estadisticas': renderEstadisticas,
            '#maintenance': renderMaintenanceCalendar, '#configuracion': renderConfiguracion
        };

        function router() { 
            const hash = window.location.hash || '#dashboard'; 
            const [path, qs] = hash.split('?'); 
            const params = new URLSearchParams(qs); 
            
            document.querySelectorAll('.nav-item-with-submenu').forEach(el => el.classList.remove('open'));
            
            if (path.startsWith('#inventory-')) renderGenericListPage(appContent, {category: path.replace('#inventory-', '')}, inventoryCategoryConfig, 'inventory', '💻'); 
            else if (path.startsWith('#credentials-')) renderGenericListPage(appContent, {category: path.replace('#credentials-', '')}, credentialsCategoryConfig, 'credentials', '🔑'); 
            else if (path.startsWith('#services-')) renderGenericListPage(appContent, {category: path.replace('#services-', '')}, servicesCategoryConfig, 'services', '📡'); 
            else if (routes[path]) routes[path](appContent, Object.fromEntries(params)); 
            else appContent.innerHTML = '<div class="card"><h1>404 - Página no encontrada</h1></div>';
            
            document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            const activeLinks = document.querySelectorAll(`a[href="${hash}"]`);
            activeLinks.forEach(a => {
                a.classList.add('active');
                let parent = a.closest('.nav-item-with-submenu');
                if(parent) {
                    const topLink = parent.querySelector('.nav-link');
                    if(topLink) topLink.classList.add('active');
                }
            });
        }

        document.addEventListener('click', (e) => { 
            if (!e.target.closest('.nav-item-with-submenu')) {
                document.querySelectorAll('.nav-item-with-submenu').forEach(el => el.classList.remove('open'));
            }
        });

        document.body.addEventListener('click', e => { 
            const target = e.target;

            const closeBtn = target.closest('.modal-close-btn');
            if (closeBtn) closeBtn.closest('.modal-overlay').classList.add('hidden');
            
            const btnBorrar = target.closest('.action-icon-delete') || target.closest('.delete-btn');
            if (btnBorrar) {
                if(confirm('¿Seguro que quieres eliminar este elemento?')) {
                    db.collection(btnBorrar.dataset.collection).doc(btnBorrar.dataset.id).delete();
                }
            }
            
            const btnEditar = target.closest('.action-icon-edit') || target.closest('.edit-btn');
            if (btnEditar) {
                showItemFormModal(btnEditar.dataset.collection, btnEditar.dataset.category, btnEditar.dataset.id);
            }

            const btnVer = target.closest('.action-icon-view') || target.closest('.history-btn');
            if (btnVer) {
                showDeviceHistoryModal(btnVer.dataset.id);
            }
            
            const viewTicketBtn = target.closest('.view-ticket-btn') || target.closest('.btn-accion-ticket');
            if (viewTicketBtn) {
                e.preventDefault();
                showTicketModal(viewTicketBtn.dataset.id);
            }
            
            const formBtn = target.closest('.open-form-modal-btn');
            if (formBtn) showItemFormModal(formBtn.dataset.type, formBtn.dataset.category, null);
            
            const exportBtn = target.closest('.export-btn');
            if (exportBtn) {
                exportBtn.dataset.format === 'pdf' ? exportToPDF('data-table', 'reporte') : exportToCSV('data-table', 'reporte');
            }
        });

        auth.onAuthStateChanged(user => {
            if (user) {
                window.addEventListener('hashchange', router); 
                router(); 
            } else {
                appContent.innerHTML = `
                    <div style="padding: 40px; width: 100%;">
                        <div class="card" style="border-left: 5px solid #D32F2F;">
                            <h2 style="color: #D32F2F;">🔒 Acceso Denegado</h2>
                            <p>No tienes una sesión activa en el ERP. Por favor, inicia sesión desde la pantalla principal para poder acceder a la Gestión de TI.</p>
                        </div>
                    </div>`;
            }
        });
    }

    iniciarAppGLPI();
})();
