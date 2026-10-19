<?php
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}
?>
<div class="obs-metrics-wrapper">

  <header class="hero">
    <div class="hero-inner">
      <h1>Resultados de la Encuesta: Viaje de la Paciente con Cáncer de Mama</h1>
      <p>Análisis detallado pregunta por pregunta de las <strong>612 personas</strong> registradas en la pestaña <strong>TOTAL</strong>, unificando las respuestas de la Encuesta Completa (280 personas) y la Encuesta Corta (332 personas).</p>

      <div class="kpi-row">
        <div class="kpi-box">
          <div class="lbl">Total Personas Encuestadas</div>
          <div class="val" id="kpi-total">612</div>
          <div class="sub" id="kpi-total-sub">100% de la pestaña TOTAL</div>
        </div>
        <div class="kpi-box">
          <div class="lbl">Encuesta Completa / Corta</div>
          <div class="val" id="kpi-split">280 / 332</div>
          <div class="sub">Personas por versión de encuesta</div>
        </div>
        <div class="kpi-box">
          <div class="lbl">Detección por Bulto o Nódulo</div>
          <div class="val" id="kpi-bulto">44.4%</div>
          <div class="sub">271 de 611 respuestas válidas</div>
        </div>
        <div class="kpi-box">
          <div class="lbl">Acudió a Privado por Rapidez</div>
          <div class="val" id="kpi-privado">47.6%</div>
          <div class="sub">291 de 611 respuestas válidas</div>
        </div>
        <div class="kpi-box">
          <div class="lbl">Retraso Percibido en Tratamiento</div>
          <div class="val" id="kpi-retraso">60.6%</div>
          <div class="sub">371 de 612 respuestas válidas</div>
        </div>
      </div>
    </div>
  </header>

  <div class="filter-bar">
    <div class="filter-inner">
      <div class="f-controls">
        <div class="f-group">
          <label for="f-survey">Versión de Encuesta</label>
          <select id="f-survey">
            <option value="ALL">Ambas Encuestas consolidadas (612)</option>
            <option value="Encuesta Completa">Solo Encuesta Completa (280)</option>
            <option value="Encuesta Corta">Solo Encuesta Corta (332)</option>
          </select>
        </div>
        <div class="f-group">
          <label for="f-system">Sistema de Salud</label>
          <select id="f-system">
            <option value="ALL">Todos los Sistemas</option>
            <option value="EsSalud">EsSalud (282)</option>
            <option value="Minsa">Minsa (182)</option>
            <option value="Seguro Privado">Seguro Privado (110)</option>
            <option value="FFAA">FFAA (21)</option>
            <option value="Particular">Particular (17)</option>
          </select>
        </div>
        <div class="f-group">
          <label for="f-region">Ubicación Geográfica</label>
          <select id="f-region">
            <option value="ALL">Todo el Perú (612)</option>
            <option value="LIMA">Solo residentes en Lima (292)</option>
            <option value="PROV">Solo Regiones fuera de Lima (320)</option>
          </select>
        </div>
        <div class="f-group">
          <label for="f-search">Buscar Pregunta</label>
          <input type="text" id="f-search" placeholder="Ej. biopsia, estadio, espera..." />
        </div>
      </div>
      <div style="display:flex; align-items:center; gap:0.85rem; flex-wrap:wrap;">
        <span class="f-count-badge" id="f-count-badge">
          <span class="dot"></span>
          <span id="f-count-text">612 de 612 personas (100%)</span>
        </span>
        <label style="font-size:0.8rem; font-weight:600; color:var(--text-muted); display:flex; align-items:center; gap:0.4rem; cursor:pointer;">
          <input type="checkbox" id="f-show-na" /> Incluir "Sin respuesta" en gráficas
        </label>
        <button class="btn-reset" id="btn-reset">Restablecer</button>
      </div>
    </div>
    <div class="active-filters-row" id="active-filters-row" style="display:none;">
      <span class="active-filters-lbl">Filtros activos:</span>
      <div class="active-chips" id="active-chips"></div>
      <button class="btn-clear-all" id="btn-clear-chips">Limpiar filtros</button>
    </div>
  </div>

  <div class="main-wrap">
    <aside class="sidebar" id="sidebar-aside">
      <div class="sidebar-title" id="sidebar-toggle-btn" role="button" tabindex="0" aria-expanded="false">
        <span>Índice de Preguntas (43)</span>
        <span class="sidebar-toggle-icon" aria-hidden="true">▾</span>
      </div>
      <div id="sidebar-nav" class="sidebar-nav-content"></div>
    </aside>

    <main id="questions-root"></main>
  </div>

  <button id="obs-btn-back-top" class="obs-btn-back-top" type="button" aria-label="Volver arriba">
    <span aria-hidden="true">↑</span>
    <span>Volver arriba</span>
  </button>

</div>
