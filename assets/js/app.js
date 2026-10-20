const charts = {};

    const COLORS = [
      '#432682', '#0ea5e9', '#cc3366', '#573e9e', '#ffbc7d',
      '#059669', '#d97706', '#2563eb', '#9333ea', '#0d9488'
    ];

    function getFilteredRecords() {
      const sSystem = document.getElementById('f-system') ? document.getElementById('f-system').value : 'ALL';
      const sRegion = document.getElementById('f-region') ? document.getElementById('f-region').value : 'ALL';

      return DATA.records.filter(r => {
        if (sSystem !== 'ALL' && r.J !== sSystem) return false;
        if (sRegion === 'LIMA' && r.H !== 'Lima') return false;
        if (sRegion === 'PROV' && r.H === 'Lima') return false;
        return true;
      });
    }

    function updateActiveFilterChips(records) {
      const sSystem = document.getElementById('f-system');
      const sRegion = document.getElementById('f-region');
      const sSearch = document.getElementById('f-search');
      const sShowNA = document.getElementById('f-show-na');

      const countText = document.getElementById('f-count-text');
      const pct = DATA.totalCount ? ((records.length / DATA.totalCount) * 100).toFixed(1) : '0';
      countText.textContent = `${records.length} de ${DATA.totalCount} personas (${pct}%)`;

      const chipsContainer = document.getElementById('active-chips');
      const row = document.getElementById('active-filters-row');
      chipsContainer.innerHTML = '';

      const activeList = [];

      if (sSystem && sSystem.value !== 'ALL') {
        activeList.push({
          label: `Sistema: ${sSystem.value}`,
          clear: () => { sSystem.value = 'ALL'; renderDashboard(); }
        });
      }
      if (sRegion && sRegion.value !== 'ALL') {
        const txt = sRegion.options[sRegion.selectedIndex].text.split('(')[0].trim();
        activeList.push({
          label: `Región: ${txt}`,
          clear: () => { sRegion.value = 'ALL'; renderDashboard(); }
        });
      }
      if (sSearch.value.trim() !== '') {
        activeList.push({
          label: `Búsqueda: "${sSearch.value.trim()}"`,
          clear: () => { sSearch.value = ''; renderDashboard(); }
        });
      }
      if (sShowNA.checked) {
        activeList.push({
          label: 'Con "Sin respuesta" en gráficas',
          clear: () => { sShowNA.checked = false; renderDashboard(); }
        });
      }

      if (activeList.length === 0) {
        row.style.display = 'none';
      } else {
        row.style.display = 'flex';
        activeList.forEach(item => {
          const chip = document.createElement('span');
          chip.className = 'filter-chip';
          chip.textContent = item.label;

          const btn = document.createElement('span');
          btn.className = 'filter-chip-remove';
          btn.innerHTML = '&times;';
          btn.title = 'Quitar este filtro';
          btn.addEventListener('click', item.clear);

          chip.appendChild(btn);
          chipsContainer.appendChild(chip);
        });
      }
    }

    function updateKPIs(records) {
      const total = records.length;
      const validQ = records.filter(r => r.Q !== 'Sin respuesta').length;
      const bultoC = records.filter(r => r.Q === 'Encontró un bulto o nódulo').length;

      const validAT = records.filter(r => r.AT !== 'Sin respuesta').length;
      const privC = records.filter(r => r.AT === 'Sí').length;

      const validAU = records.filter(r => r.AU !== 'Sin respuesta').length;
      const retC = records.filter(r => r.AU === 'Sí').length;

      const elTotal = document.getElementById('kpi-total');
      if (elTotal) elTotal.textContent = total + ' personas';

      const elTotalSub = document.getElementById('kpi-total-sub');
      if (elTotalSub) {
        elTotalSub.textContent = total === DATA.totalCount ? '100% de la muestra total' : ((total / DATA.totalCount * 100).toFixed(1) + '% del total de ' + DATA.totalCount);
      }

      const elBulto = document.getElementById('kpi-bulto');
      if (elBulto) elBulto.textContent = validQ ? (bultoC / validQ * 100).toFixed(1) + '%' : '0%';

      const elPrivado = document.getElementById('kpi-privado');
      if (elPrivado) elPrivado.textContent = validAT ? (privC / validAT * 100).toFixed(1) + '%' : '0%';

      const elRetraso = document.getElementById('kpi-retraso');
      if (elRetraso) elRetraso.textContent = validAU ? (retC / validAU * 100).toFixed(1) + '%' : '0%';
    }

    function renderDashboard() {
      const records = getFilteredRecords();
      const search = document.getElementById('f-search').value.trim().toLowerCase();
      const showNAInChart = document.getElementById('f-show-na').checked;

      updateKPIs(records);
      updateActiveFilterChips(records);

      Object.values(charts).forEach(c => c.destroy());
      for (const k in charts) delete charts[k];

      const root = document.getElementById('questions-root');
      const sideNav = document.getElementById('sidebar-nav');
      root.innerHTML = '';
      sideNav.innerHTML = '';

      const blocks = [];
      DATA.questions.forEach(q => {
        if (!blocks.includes(q.block)) blocks.push(q.block);
      });

      blocks.forEach((blockName, bIdx) => {
        const blockQs = DATA.questions.filter(q => {
          if (q.block !== blockName) return false;
          if (!search) return true;
          return (
            q.title.toLowerCase().includes(search) ||
            q.subtitle.toLowerCase().includes(search) ||
            q.code.toLowerCase().includes(search) ||
            q.analysis.toLowerCase().includes(search)
          );
        });

        if (blockQs.length === 0) return;

        // Add block to sidebar
        const sbTitle = document.createElement('div');
        sbTitle.className = 'nav-block-title';
        sbTitle.textContent = blockName;
        sideNav.appendChild(sbTitle);

        // Add section divider in main
        const secDiv = document.createElement('div');
        secDiv.className = 'section-divider';
        secDiv.innerHTML = `<h2>${blockName}</h2><span>${blockQs.length} preguntas</span>`;
        root.appendChild(secDiv);

        blockQs.forEach(q => {
          // Sidebar link
          const link = document.createElement('a');
          link.className = 'nav-q-link';
          link.href = '#card-' + q.col;
          link.textContent = q.title;
          link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = 'card-' + q.col;
            const targetEl = document.getElementById(targetId);
            if (targetEl) {
              const headerOffset = window.innerWidth <= 768 ? 85 : 110;
              const targetPosition = targetEl.getBoundingClientRect().top + window.pageYOffset - headerOffset;

              window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
              });

              targetEl.classList.add('q-card-highlight');
              setTimeout(() => {
                targetEl.classList.remove('q-card-highlight');
              }, 1200);

              document.querySelectorAll('.nav-q-link').forEach(l => l.classList.remove('is-active'));
              link.classList.add('is-active');

              const sidebar = document.getElementById('sidebar-aside');
              if (sidebar && window.innerWidth <= 1024) {
                sidebar.classList.remove('is-open');
                const btn = document.getElementById('sidebar-toggle-btn');
                if (btn) btn.setAttribute('aria-expanded', 'false');
              }
            }
          });
          sideNav.appendChild(link);

          // Tally responses
          const counts = {};
          let validCount = 0;
          let naCount = 0;

          records.forEach(r => {
            const ans = r[q.col] || 'Sin respuesta';
            if (ans === 'Sin respuesta') naCount++;
            else validCount++;

            if (!counts[ans]) {
              counts[ans] = { total: 0 };
            }
            counts[ans].total++;
          });

          const entries = Object.entries(counts).sort((a, b) => {
            if (a[0] === 'Sin respuesta') return 1;
            if (b[0] === 'Sin respuesta') return -1;
            return b[1].total - a[1].total;
          });

          const chartEntries = showNAInChart
            ? entries
            : entries.filter(e => e[0] !== 'Sin respuesta');

          const isMobile = window.innerWidth <= 768;
          const isDoughnut = q.chartType === 'doughnut' && chartEntries.length <= 5;
          const chartHeight = isDoughnut 
            ? (isMobile ? 260 : 290) 
            : Math.max(isMobile ? 240 : 270, chartEntries.length * (isMobile ? 34 : 38) + 60);

          const tableRows = entries.map(([ans, st]) => {
            const isNA = ans === 'Sin respuesta';
            const pctTotal = records.length ? ((st.total / records.length) * 100).toFixed(1) : '0.0';
            const pctValid = (!isNA && validCount) ? ((st.total / validCount) * 100).toFixed(1) + '%' : '—';
            const wBar = records.length ? (st.total / records.length * 100).toFixed(1) : 0;

            return `
              <tr class="${isNA ? 'na-row' : ''}">
                <td class="col-main" style="font-weight:${isNA ? '500' : '600'};">${ans}</td>
                <td class="num col-count" style="font-weight:700;">${st.total}</td>
                <td class="num col-pct"><span class="pct-badge">${pctTotal}%</span></td>
                <td class="num col-extra" style="color:var(--text-muted); font-size:0.78rem;">${pctValid}</td>
                <td class="bar-cell col-extra">
                  <div class="mini-bar-bg" title="${st.total} personas (${pctTotal}%)">
                    <div class="mini-bar-fill" style="width:${wBar}%"></div>
                  </div>
                </td>
              </tr>
            `;
          }).join('');

          const card = document.createElement('article');
          card.className = 'q-card';
          card.id = 'card-' + q.col;
          card.innerHTML = `
            <div class="q-header">
              <div>
                <div class="q-badges">
                  <span class="tag-primary">${q.code}</span>
                  <span class="tag-neutral">Respondieron: ${validCount} personas (${records.length ? (validCount/records.length*100).toFixed(1) : 0}%)</span>
                  ${naCount > 0 ? `<span class="tag-na">Sin respuesta / No aplica: ${naCount} personas</span>` : ''}
                </div>
                <div class="q-title">${q.title}</div>
                <div class="q-sub">${q.subtitle}</div>
              </div>
            </div>
            <div class="q-content">
              <div class="chart-container" style="height:${chartHeight}px;">
                <canvas id="chart-${q.col}"></canvas>
              </div>
              <div class="ans-table-wrap">
                <table class="ans-table">
                  <thead>
                    <tr>
                      <th class="col-main">Opción de Respuesta</th>
                      <th class="num col-count">Personas</th>
                      <th class="num col-pct">% Total</th>
                      <th class="num col-extra">% Válido</th>
                      <th class="col-extra">Distribución</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${tableRows}
                  </tbody>
                </table>
              </div>
            </div>
            <div class="q-analysis">
              <div class="q-analysis-title">📌 Análisis de Resultados — ${q.code}</div>
              <div>${q.analysis}</div>
            </div>
          `;

          root.appendChild(card);

          // Build Chart
          const labels = chartEntries.map(e => e[0]);
          const dTotal = chartEntries.map(e => e[1].total);
          const ctx = document.getElementById('chart-' + q.col).getContext('2d');

          if (isDoughnut) {
            charts[q.col] = new Chart(ctx, {
              type: 'doughnut',
              data: {
                labels,
                datasets: [{
                  data: dTotal,
                  backgroundColor: labels.map((l, idx) => l === 'Sin respuesta' ? '#cbd5e1' : COLORS[idx % COLORS.length]),
                  borderWidth: 2,
                  borderColor: '#ffffff'
                }]
              },
              options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom',
                    labels: { 
                      font: { family: 'Inter', size: isMobile ? 10 : 12 }, 
                      padding: isMobile ? 8 : 14,
                      boxWidth: isMobile ? 12 : 24
                    }
                  },
                  tooltip: {
                    callbacks: {
                      label: function(context) {
                        const v = context.raw;
                        const base = showNAInChart ? records.length : validCount;
                        const pct = base ? ((v / base) * 100).toFixed(1) : 0;
                        return ` ${context.label}: ${v} personas (${pct}%)`;
                      }
                    }
                  }
                }
              }
            });
          } else {
            charts[q.col] = new Chart(ctx, {
              type: 'bar',
              data: {
                labels,
                datasets: [
                  {
                    label: 'Personas',
                    data: dTotal,
                    backgroundColor: labels.map(l => l === 'Sin respuesta' ? '#cbd5e1' : '#432682'),
                    borderRadius: 4,
                    barPercentage: 0.75
                  }
                ]
              },
              options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  x: {
                    grid: { color: '#f1f5f9' },
                    ticks: { font: { family: 'Inter', size: isMobile ? 9 : 11 } },
                    title: { 
                      display: window.innerWidth > 480, 
                      text: 'Cantidad de Personas', 
                      font: { family: 'Inter', size: isMobile ? 9 : 11, weight: '600' } 
                    }
                  },
                  y: {
                    grid: { display: false },
                    ticks: {
                      font: { family: 'Inter', size: isMobile ? 10 : 11, weight: '600' },
                      color: '#1e293b',
                      callback: function(value) {
                        const lbl = this.getLabelForValue(value);
                        const maxLen = window.innerWidth <= 480 ? 18 : (isMobile ? 24 : 38);
                        return lbl.length > maxLen ? lbl.substring(0, maxLen) + '…' : lbl;
                      }
                    }
                  }
                },
                plugins: {
                  legend: {
                    display: false
                  },
                  tooltip: {
                    callbacks: {
                      label: function(context) {
                        const tot = context.raw;
                        const base = showNAInChart ? records.length : validCount;
                        const pct = base ? ((tot / base) * 100).toFixed(1) : 0;
                        return ` ${tot} personas (${pct}%)`;
                      }
                    }
                  }
                }
              }
            });
          }
        });
      });

      setupScrollSpy();
    }

    let scrollSpyObserver = null;
    function setupScrollSpy() {
      if (scrollSpyObserver) {
        scrollSpyObserver.disconnect();
      }
      const cards = document.querySelectorAll('.q-card');
      const links = document.querySelectorAll('.nav-q-link');
      if (!cards.length || !links.length) return;

      scrollSpyObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const id = entry.target.id;
            links.forEach(l => {
              if (l.getAttribute('href') === '#' + id) {
                l.classList.add('is-active');
              } else {
                l.classList.remove('is-active');
              }
            });
          }
        });
      }, {
        rootMargin: '-15% 0px -75% 0px'
      });

      cards.forEach(card => scrollSpyObserver.observe(card));
    }

    function setupBackToTop() {
      const btn = document.getElementById('obs-btn-back-top');
      if (!btn) return;

      window.addEventListener('scroll', () => {
        if (window.scrollY > 400) {
          btn.classList.add('is-visible');
        } else {
          btn.classList.remove('is-visible');
        }
      }, { passive: true });

      btn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    function resetAllFilters() {
      const sSystem = document.getElementById('f-system');
      const sRegion = document.getElementById('f-region');
      const sSearch = document.getElementById('f-search');
      const sShowNA = document.getElementById('f-show-na');
      if (sSystem) sSystem.value = 'ALL';
      if (sRegion) sRegion.value = 'ALL';
      if (sSearch) sSearch.value = '';
      if (sShowNA) sShowNA.checked = false;
      renderDashboard();
    }

    function initObservatorioMetrics() {
      if (!document.getElementById('questions-root')) return;

      ['f-system', 'f-region', 'f-show-na'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('change', renderDashboard);
      });
      const searchEl = document.getElementById('f-search');
      if (searchEl) searchEl.addEventListener('input', renderDashboard);

      const btnReset = document.getElementById('btn-reset');
      if (btnReset) btnReset.addEventListener('click', resetAllFilters);

      const btnClearChips = document.getElementById('btn-clear-chips');
      if (btnClearChips) btnClearChips.addEventListener('click', resetAllFilters);

      const sidebarToggleBtn = document.getElementById('sidebar-toggle-btn');
      const sidebarAside = document.getElementById('sidebar-aside');
      if (sidebarToggleBtn && sidebarAside) {
        sidebarToggleBtn.addEventListener('click', () => {
          const isOpen = sidebarAside.classList.toggle('is-open');
          sidebarToggleBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        });
      }

      setupBackToTop();
      renderDashboard();
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initObservatorioMetrics);
    } else {
      initObservatorioMetrics();
    }


