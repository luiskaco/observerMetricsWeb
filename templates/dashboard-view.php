<?php
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}
?>
<div class="obs-metrics-wrapper">

  <header class="hero">
    <div class="hero-inner">
      <h1>Resultados de la Encuesta: La Ruta de la Paciente con Cáncer de Mama</h1>
      <p>Análisis detallado pregunta por pregunta de la muestra consolidada de <strong>612 personas</strong> diagnosticadas con cáncer de mama en el Perú.</p>

      <div class="kpi-row">
        <div class="kpi-box">
          <div class="lbl">Total Personas Encuestadas</div>
          <div class="val" id="kpi-total">612 personas</div>
          <div class="sub" id="kpi-total-sub">100% de la muestra total</div>
        </div>
        <div class="kpi-box">
          <div class="lbl">Detección por Bulto o Nódulo</div>
          <div class="val" id="kpi-bulto">44.3%</div>
          <div class="sub" id="kpi-bulto-sub">271 de 612 encuestadas</div>
        </div>
        <div class="kpi-box">
          <div class="lbl">Acudió a Privado por Rapidez</div>
          <div class="val" id="kpi-privado">47.9%</div>
          <div class="sub" id="kpi-privado-sub">293 de 612 encuestadas</div>
        </div>
        <div class="kpi-box">
          <div class="lbl">Retraso Percibido en Tratamiento</div>
          <div class="val" id="kpi-retraso">60.6%</div>
          <div class="sub" id="kpi-retraso-sub">371 de 612 encuestadas</div>
        </div>
      </div>
    </div>
  </header>

  <div class="filter-bar">
    <div class="filter-inner">
      <div class="f-controls">
        <div class="f-group obs-multiselect" id="ms-sector" data-filter="sector">
          <label id="lbl-sector">Sector</label>
          <button type="button" class="obs-ms-trigger" aria-haspopup="listbox" aria-expanded="false" id="btn-ms-sector">
            <span class="obs-ms-trigger-text" id="txt-ms-sector">Todos los Sectores (612)</span>
            <span class="obs-ms-arrow">▾</span>
          </button>
          <div class="obs-ms-dropdown" role="listbox">
            <div class="obs-ms-actions">
              <button type="button" class="obs-ms-action-btn" data-action="all" data-target="f-sector">Todos</button>
              <button type="button" class="obs-ms-action-btn" data-action="clear" data-target="f-sector">Limpiar</button>
            </div>
            <div class="obs-ms-options">
              <label class="obs-ms-option">
                <input type="checkbox" name="f-sector" value="PUBLIC" />
                <span class="obs-ms-opt-text">Público</span>
                <span class="obs-ms-opt-count">485</span>
              </label>
              <label class="obs-ms-option">
                <input type="checkbox" name="f-sector" value="PRIVATE" />
                <span class="obs-ms-opt-text">Privado</span>
                <span class="obs-ms-opt-count">127</span>
              </label>
            </div>
          </div>
        </div>

        <div class="f-group obs-multiselect" id="ms-system" data-filter="system">
          <label id="lbl-system">Sistema de Salud</label>
          <button type="button" class="obs-ms-trigger" aria-haspopup="listbox" aria-expanded="false" id="btn-ms-system">
            <span class="obs-ms-trigger-text" id="txt-ms-system">Todos los Sistemas (612)</span>
            <span class="obs-ms-arrow">▾</span>
          </button>
          <div class="obs-ms-dropdown" role="listbox">
            <div class="obs-ms-actions">
              <button type="button" class="obs-ms-action-btn" data-action="all" data-target="f-system">Todos</button>
              <button type="button" class="obs-ms-action-btn" data-action="clear" data-target="f-system">Limpiar</button>
            </div>
            <div class="obs-ms-options">
              <label class="obs-ms-option">
                <input type="checkbox" name="f-system" value="EsSalud" />
                <span class="obs-ms-opt-text">EsSalud</span>
                <span class="obs-ms-opt-count">282</span>
              </label>
              <label class="obs-ms-option">
                <input type="checkbox" name="f-system" value="Minsa" />
                <span class="obs-ms-opt-text">Minsa</span>
                <span class="obs-ms-opt-count">182</span>
              </label>
              <label class="obs-ms-option">
                <input type="checkbox" name="f-system" value="Seguro Privado" />
                <span class="obs-ms-opt-text">Seguro Privado</span>
                <span class="obs-ms-opt-count">110</span>
              </label>
              <label class="obs-ms-option">
                <input type="checkbox" name="f-system" value="FFAA" />
                <span class="obs-ms-opt-text">FFAA</span>
                <span class="obs-ms-opt-count">21</span>
              </label>
              <label class="obs-ms-option">
                <input type="checkbox" name="f-system" value="Particular" />
                <span class="obs-ms-opt-text">Particular</span>
                <span class="obs-ms-opt-count">17</span>
              </label>
            </div>
          </div>
        </div>

        <div class="f-group obs-multiselect" id="ms-region" data-filter="region">
          <label id="lbl-region">Ubicación Geográfica</label>
          <button type="button" class="obs-ms-trigger" aria-haspopup="listbox" aria-expanded="false" id="btn-ms-region">
            <span class="obs-ms-trigger-text" id="txt-ms-region">Todo el Perú (612)</span>
            <span class="obs-ms-arrow">▾</span>
          </button>
          <div class="obs-ms-dropdown" role="listbox">
            <div class="obs-ms-actions">
              <button type="button" class="obs-ms-action-btn" data-action="all" data-target="f-region">Todos</button>
              <button type="button" class="obs-ms-action-btn" data-action="clear" data-target="f-region">Limpiar</button>
            </div>
            <div class="obs-ms-options">
              <label class="obs-ms-option">
                <input type="checkbox" name="f-region" value="LIMA" />
                <span class="obs-ms-opt-text">Solo residentes en Lima</span>
                <span class="obs-ms-opt-count">292</span>
              </label>
              <label class="obs-ms-option">
                <input type="checkbox" name="f-region" value="PROV" />
                <span class="obs-ms-opt-text">Solo Regiones fuera de Lima</span>
                <span class="obs-ms-opt-count">320</span>
              </label>
            </div>
          </div>
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
          <input type="checkbox" id="f-show-na" /> Incluir "No respondió" en gráficas
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
