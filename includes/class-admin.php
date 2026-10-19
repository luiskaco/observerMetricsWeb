<?php
/**
 * Observatorio Métricas - Admin Controller & UI
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class Observatorio_Metricas_Admin {

    private static ?Observatorio_Metricas_Admin $instance = null;

    public static function instance(): Observatorio_Metricas_Admin {
        if ( null === self::$instance ) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    private function __construct() {
        add_action( 'admin_menu', [ $this, 'add_admin_menu' ] );
        add_action( 'admin_init', [ $this, 'handle_actions' ] );
        add_action( 'admin_enqueue_scripts', [ $this, 'enqueue_admin_assets' ] );
    }

    public function add_admin_menu(): void {
        add_menu_page(
            __( 'Métricas Observatorio', 'observatorio-metricas' ),
            __( 'Métricas', 'observatorio-metricas' ),
            'manage_options',
            'observatorio-metricas',
            [ $this, 'render_admin_page' ],
            'dashicons-chart-bar',
            28
        );
    }

    public function enqueue_admin_assets( string $hook ): void {
        if ( 'toplevel_page_observatorio-metricas' !== $hook ) {
            return;
        }

        wp_add_inline_style(
            'wp-admin',
            '
            .obs-admin-wrap { max-width: 1080px; margin-top: 1.5rem; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
            .obs-admin-wrap hr.wp-header-end { display: none !important; }
            .obs-admin-alert { display: flex; align-items: flex-start; gap: 0.85rem; padding: 0.9rem 1.15rem; border-radius: 8px; margin-bottom: 1.25rem; font-size: 0.92rem; line-height: 1.45; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
            .obs-admin-alert.obs-alert-success { background: #ecfdf5; border: 1px solid #6ee7b7; color: #064e3b; }
            .obs-admin-alert.obs-alert-success strong { color: #065f46; font-weight: 700; }
            .obs-admin-alert.obs-alert-info { background: #f0f9ff; border: 1px solid #7dd3fc; color: #0c4a6e; }
            .obs-admin-alert.obs-alert-info strong { color: #0369a1; font-weight: 700; }
            .obs-admin-alert.obs-alert-error { background: #fef2f2; border: 1px solid #fca5a5; color: #7f1d1d; }
            .obs-admin-alert.obs-alert-error strong { color: #991b1b; font-weight: 700; }
            .obs-alert-icon { display: inline-flex; align-items: center; justify-content: center; width: 22px; height: 22px; border-radius: 50%; background: rgba(0,0,0,0.07); font-weight: 800; font-size: 0.78rem; flex-shrink: 0; margin-top: 0.1rem; }
            .obs-alert-body { flex: 1; }
            .obs-alert-dismiss { background: transparent; border: none; font-size: 1.25rem; line-height: 1; cursor: pointer; color: inherit; opacity: 0.55; padding: 0 0.2rem; }
            .obs-alert-dismiss:hover { opacity: 1; }
            .obs-admin-wrap .notice { background: #fff !important; border-left: 4px solid #10b981 !important; border-radius: 6px !important; box-shadow: 0 1px 3px rgba(0,0,0,0.06) !important; margin: 1rem 0 !important; }
            .obs-admin-wrap .notice p { color: #0f172a !important; font-size: 0.9rem !important; }
            .obs-admin-wrap .notice strong { color: #047857 !important; }
            .obs-admin-header { background: linear-gradient(135deg, #24104d 0%, #432682 60%, #573e9e 100%); color: #fff; padding: 1.75rem 2rem; border-radius: 12px; margin-bottom: 1.5rem; box-shadow: 0 4px 14px rgba(0,0,0,0.08); }
            .obs-admin-header > h1 { color: #fff; font-size: 1.6rem; font-weight: 700; margin: 0 0 0.4rem 0; }
            .obs-admin-header > p { color: #e9d5ff; font-size: 0.92rem; margin: 0; }
            .obs-stat-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 1.5rem; }
            .obs-stat-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 1.1rem 1.25rem; box-shadow: 0 1px 3px rgba(0,0,0,0.04); }
            .obs-stat-card .lbl { font-size: 0.72rem; text-transform: uppercase; font-weight: 700; color: #64748b; letter-spacing: 0.04em; }
            .obs-stat-card .val { font-size: 1.6rem; font-weight: 800; color: #1e1b2e; margin-top: 0.2rem; }
            .obs-stat-card .sub { font-size: 0.76rem; color: #94a3b8; margin-top: 0.15rem; }
            .obs-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 1.5rem 1.75rem; margin-bottom: 1.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.04); }
            .obs-card h2 { font-size: 1.15rem; font-weight: 700; color: #1e1b2e; margin: 0 0 0.5rem 0; display: flex; align-items: center; gap: 0.5rem; }
            .obs-card p { font-size: 0.88rem; color: #475569; margin: 0 0 1.2rem 0; line-height: 1.5; }
            .obs-upload-dropzone { border: 2px dashed #cbd5e1; border-radius: 8px; padding: 2rem 1.5rem; text-align: center; background: #f8fafc; transition: all 0.2s; cursor: pointer; }
            .obs-upload-dropzone:hover { border-color: #432682; background: #f3efff; }
            .obs-upload-dropzone input[type="file"] { margin: 0.75rem auto 0; display: block; }
            .obs-btn-primary { background: #432682 !important; border-color: #432682 !important; color: #fff !important; font-weight: 600 !important; padding: 0.45rem 1.25rem !important; height: auto !important; border-radius: 6px !important; }
            .obs-btn-primary:hover { background: #2f1761 !important; border-color: #2f1761 !important; }
            .obs-btn-danger { background: #fff !important; border-color: #ef4444 !important; color: #ef4444 !important; font-weight: 600 !important; }
            .obs-btn-danger:hover { background: #fee2e2 !important; }
            .obs-shortcode-tag { background: #f1f5f9; border: 1px solid #cbd5e1; padding: 0.2rem 0.5rem; border-radius: 4px; font-family: monospace; font-size: 0.9rem; color: #334155; }
            '
        );
    }

    public function handle_actions(): void {
        if ( ! current_user_can( 'manage_options' ) ) {
            return;
        }

        // Descargar JSON activo
        if ( isset( $_GET['action'] ) && 'obs_export_json' === $_GET['action'] ) {
            check_admin_referer( 'obs_export_json_action' );
            $data = $this->get_active_dataset();
            header( 'Content-Type: application/json; charset=utf-8' );
            header( 'Content-Disposition: attachment; filename="observatorio-dataset-' . date( 'Y-m-d' ) . '.json"' );
            echo wp_json_encode( $data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE );
            exit;
        }

        // Restablecer a dataset base
        if ( isset( $_POST['obs_reset_data'] ) ) {
            check_admin_referer( 'obs_reset_data_action' );
            $upload_file = $this->get_upload_json_path();
            if ( file_exists( $upload_file ) ) {
                unlink( $upload_file );
            }
            delete_option( 'obs_metrics_last_update' );
            wp_safe_redirect( add_query_arg( [ 'page' => 'observatorio-metricas', 'msg' => 'reset_success' ], admin_url( 'admin.php' ) ) );
            exit;
        }

        // Subir nuevo archivo (Excel o JSON)
        if ( isset( $_POST['obs_upload_submit'] ) ) {
            check_admin_referer( 'obs_metrics_upload_action', 'obs_metrics_nonce' );

            if ( empty( $_FILES['metricas_file']['tmp_name'] ) || ! is_uploaded_file( $_FILES['metricas_file']['tmp_name'] ) ) {
                wp_safe_redirect( add_query_arg( [ 'page' => 'observatorio-metricas', 'msg' => 'no_file' ], admin_url( 'admin.php' ) ) );
                exit;
            }

            $file_info = $_FILES['metricas_file'];
            $file_name = sanitize_file_name( $file_info['name'] );
            $file_ext  = strtolower( pathinfo( $file_name, PATHINFO_EXTENSION ) );
            $tmp_path  = $file_info['tmp_name'];

            try {
                $dataset = [];

                if ( 'xlsx' === $file_ext ) {
                    require_once OBS_METRICS_PLUGIN_DIR . 'includes/class-xlsx-parser.php';
                    $parsed = Observatorio_Xlsx_Parser::parse( $tmp_path );

                    // Obtener metadata de preguntas
                    $questions = $this->get_default_questions();

                    $dataset = [
                        'totalCount' => $parsed['totalCount'],
                        'longCount'  => $parsed['longCount'],
                        'shortCount' => $parsed['shortCount'],
                        'questions'  => $questions,
                        'records'    => $parsed['records'],
                        'updatedAt'  => current_time( 'mysql' ),
                        'sourceFile' => $file_name,
                    ];
                } elseif ( 'json' === $file_ext ) {
                    $json_content = file_get_contents( $tmp_path );
                    $json_data    = json_decode( $json_content, true );

                    if ( ! is_array( $json_data ) || ! isset( $json_data['records'] ) || ! isset( $json_data['questions'] ) ) {
                        throw new Exception( __( 'El archivo JSON no tiene la estructura válida esperada (debe contener "records" y "questions").', 'observatorio-metricas' ) );
                    }

                    $dataset = $json_data;
                    $dataset['updatedAt']  = current_time( 'mysql' );
                    $dataset['sourceFile'] = $file_name;
                } else {
                    throw new Exception( __( 'Formato no soportado. Por favor sube un archivo Excel (.xlsx) o un archivo JSON (.json).', 'observatorio-metricas' ) );
                }

                // Guardar dataset en wp-content/uploads/observatorio-metricas/data.json
                $save_path = $this->get_upload_json_path();
                $dir_path  = dirname( $save_path );
                if ( ! is_dir( $dir_path ) ) {
                    wp_mkdir_p( $dir_path );
                }

                $saved = file_put_contents( $save_path, wp_json_encode( $dataset, JSON_UNESCAPED_UNICODE ) );
                if ( false === $saved ) {
                    throw new Exception( __( 'No se pudo escribir el archivo data.json en la carpeta de uploads. Verifica permisos.', 'observatorio-metricas' ) );
                }

                update_option( 'obs_metrics_last_update', [
                    'date'       => current_time( 'mysql' ),
                    'sourceFile' => $file_name,
                    'totalCount' => $dataset['totalCount'] ?? count( $dataset['records'] ),
                    'longCount'  => $dataset['longCount'] ?? 0,
                    'shortCount' => $dataset['shortCount'] ?? 0,
                ] );

                wp_safe_redirect( add_query_arg( [ 'page' => 'observatorio-metricas', 'msg' => 'upload_success' ], admin_url( 'admin.php' ) ) );
                exit;

            } catch ( Exception $e ) {
                wp_die(
                    sprintf(
                        '<h3>%s</h3><p>%s</p><p><a href="%s">&larr; %s</a></p>',
                        esc_html__( 'Error al procesar el archivo', 'observatorio-metricas' ),
                        esc_html( $e->getMessage() ),
                        esc_url( admin_url( 'admin.php?page=observatorio-metricas' ) ),
                        esc_html__( 'Volver al panel', 'observatorio-metricas' )
                    )
                );
            }
        }
    }

    public function render_admin_page(): void {
        $dataset     = $this->get_active_dataset();
        $is_custom   = file_exists( $this->get_upload_json_path() );
        $last_update = get_option( 'obs_metrics_last_update', null );
        $msg         = sanitize_text_field( $_GET['msg'] ?? '' );
        ?>
        <div class="wrap obs-admin-wrap">
            <h1 class="wp-heading-inline" style="display:none;"><?php esc_html_e( 'Métricas', 'observatorio-metricas' ); ?></h1>
            <hr class="wp-header-end" style="display:none;">

            <?php if ( 'upload_success' === $msg ) : ?>
                <div class="obs-admin-alert obs-alert-success" role="alert">
                    <span class="obs-alert-icon">✓</span>
                    <div class="obs-alert-body">
                        <strong><?php esc_html_e( '¡Data actualizada exitosamente!', 'observatorio-metricas' ); ?></strong>
                        <span><?php esc_html_e( 'Las gráficas del dashboard y tablas reflejan ahora el nuevo dataset.', 'observatorio-metricas' ); ?></span>
                    </div>
                    <button type="button" class="obs-alert-dismiss" onclick="this.closest('.obs-admin-alert').remove();" aria-label="<?php esc_attr_e( 'Cerrar', 'observatorio-metricas' ); ?>">&times;</button>
                </div>
            <?php elseif ( 'reset_success' === $msg ) : ?>
                <div class="obs-admin-alert obs-alert-info" role="alert">
                    <span class="obs-alert-icon">ℹ</span>
                    <div class="obs-alert-body">
                        <strong><?php esc_html_e( 'Restablecido:', 'observatorio-metricas' ); ?></strong>
                        <span><?php esc_html_e( 'Se ha restablecido el dataset inicial de fábrica.', 'observatorio-metricas' ); ?></span>
                    </div>
                    <button type="button" class="obs-alert-dismiss" onclick="this.closest('.obs-admin-alert').remove();" aria-label="<?php esc_attr_e( 'Cerrar', 'observatorio-metricas' ); ?>">&times;</button>
                </div>
            <?php elseif ( 'no_file' === $msg ) : ?>
                <div class="obs-admin-alert obs-alert-error" role="alert">
                    <span class="obs-alert-icon">✕</span>
                    <div class="obs-alert-body">
                        <strong><?php esc_html_e( 'Atención:', 'observatorio-metricas' ); ?></strong>
                        <span><?php esc_html_e( 'Por favor selecciona un archivo (.xlsx o .json) antes de enviar.', 'observatorio-metricas' ); ?></span>
                    </div>
                    <button type="button" class="obs-alert-dismiss" onclick="this.closest('.obs-admin-alert').remove();" aria-label="<?php esc_attr_e( 'Cerrar', 'observatorio-metricas' ); ?>">&times;</button>
                </div>
            <?php endif; ?>

            <div class="obs-admin-header">
                <h1><?php esc_html_e( 'Métricas y Dashboard del Observatorio', 'observatorio-metricas' ); ?></h1>
                <p><?php esc_html_e( 'Administrador de datos de la Encuesta: Viaje de la Paciente con Cáncer de Mama. Carga aquí nuevos consolidados en Excel para actualizar todas las métricas en la web.', 'observatorio-metricas' ); ?></p>
            </div>

            <!-- KPIs de Data Activa -->
            <div class="obs-stat-grid">
                <div class="obs-stat-card">
                    <div class="lbl"><?php esc_html_e( 'Total Registros Activos', 'observatorio-metricas' ); ?></div>
                    <div class="val"><?php echo esc_html( number_format_i18n( $dataset['totalCount'] ?? count( $dataset['records'] ?? [] ) ) ); ?></div>
                    <div class="sub"><?php esc_html_e( 'Personas en la pestaña TOTAL', 'observatorio-metricas' ); ?></div>
                </div>
                <div class="obs-stat-card">
                    <div class="lbl"><?php esc_html_e( 'Completa vs Corta', 'observatorio-metricas' ); ?></div>
                    <div class="val"><?php echo esc_html( ( $dataset['longCount'] ?? 0 ) . ' / ' . ( $dataset['shortCount'] ?? 0 ) ); ?></div>
                    <div class="sub"><?php esc_html_e( 'Desglose por versión', 'observatorio-metricas' ); ?></div>
                </div>
                <div class="obs-stat-card">
                    <div class="lbl"><?php esc_html_e( 'Preguntas en el Modelo', 'observatorio-metricas' ); ?></div>
                    <div class="val"><?php echo esc_html( count( $dataset['questions'] ?? [] ) ); ?></div>
                    <div class="sub"><?php esc_html_e( 'Gráficas y tablas mapeadas', 'observatorio-metricas' ); ?></div>
                </div>
                <div class="obs-stat-card">
                    <div class="lbl"><?php esc_html_e( 'Origen de la Data', 'observatorio-metricas' ); ?></div>
                    <div class="val" style="font-size: 1.1rem; line-height: 1.3;">
                        <?php echo $is_custom ? '🟢 ' . esc_html__( 'Personalizada', 'observatorio-metricas' ) : '🔵 ' . esc_html__( 'Base Inicial', 'observatorio-metricas' ); ?>
                    </div>
                    <div class="sub">
                        <?php
                        if ( $is_custom && ! empty( $last_update['sourceFile'] ) ) {
                            echo esc_html( $last_update['sourceFile'] . ' (' . $last_update['date'] . ')' );
                        } else {
                            esc_html_e( 'data.js predeterminado', 'observatorio-metricas' );
                        }
                        ?>
                    </div>
                </div>
            </div>

            <!-- Tarjeta: Cargar nuevo archivo -->
            <div class="obs-card">
                <h2>📊 <?php esc_html_e( 'Actualizar Datos desde Excel o JSON', 'observatorio-metricas' ); ?></h2>
                <p>
                    <?php esc_html_e( 'Sube el nuevo archivo consolidado de Excel (.xlsx) que contenga la pestaña "TOTAL". El sistema extraerá automáticamente todas las respuestas, clasificará las encuestas completas y cortas, y actualizará de inmediato todas las 43 gráficas públicas.', 'observatorio-metricas' ); ?>
                </p>

                <form method="post" enctype="multipart/form-data" action="<?php echo esc_url( admin_url( 'admin.php?page=observatorio-metricas' ) ); ?>">
                    <?php wp_nonce_field( 'obs_metrics_upload_action', 'obs_metrics_nonce' ); ?>
                    <div class="obs-upload-dropzone">
                        <span class="dashicons dashicons-upload" style="font-size: 38px; width: 38px; height: 38px; color: #432682;"></span>
                        <div style="font-size: 0.95rem; font-weight: 600; color: #1e1b2e; margin-top: 0.5rem;">
                            <?php esc_html_e( 'Haz clic para seleccionar el archivo o arrástralo aquí', 'observatorio-metricas' ); ?>
                        </div>
                        <div style="font-size: 0.8rem; color: #64748b; margin-top: 0.2rem;">
                            <?php esc_html_e( 'Formatos aceptados: .xlsx (Excel) o .json (Dataset procesado)', 'observatorio-metricas' ); ?>
                        </div>
                        <input type="file" name="metricas_file" accept=".xlsx,.json" required />
                    </div>

                    <div style="margin-top: 1.25rem; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem;">
                        <button type="submit" name="obs_upload_submit" class="button button-primary obs-btn-primary">
                            ⚡ <?php esc_html_e( 'Procesar y Actualizar Gráficas', 'observatorio-metricas' ); ?>
                        </button>

                        <div style="display: flex; gap: 0.75rem;">
                            <a href="<?php echo esc_url( wp_nonce_url( admin_url( 'admin.php?page=observatorio-metricas&action=obs_export_json' ), 'obs_export_json_action' ) ); ?>" class="button">
                                📥 <?php esc_html_e( 'Descargar JSON Actual', 'observatorio-metricas' ); ?>
                            </a>
                        </div>
                    </div>
                </form>
            </div>

            <!-- Tarjeta: Shortcodes y Uso -->
            <div class="obs-card">
                <h2>🔗 <?php esc_html_e( 'Cómo Mostrar el Dashboard en la Web', 'observatorio-metricas' ); ?></h2>
                <p><?php esc_html_e( 'Puedes insertar el dashboard interactivo en cualquier página de WordPress o plantilla de Elementor usando el siguiente shortcode:', 'observatorio-metricas' ); ?></p>
                <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1rem;">
                    <code class="obs-shortcode-tag">[observatorio_metricas]</code>
                    <a href="<?php echo esc_url( home_url( '/metricas/' ) ); ?>" target="_blank" class="button button-secondary">
                        <?php esc_html_e( 'Ver página publicada', 'observatorio-metricas' ); ?> &rarr;
                    </a>
                </div>
                <small style="color: #64748b;">
                    <?php esc_html_e( 'Tip: En Hello Elementor o temas similares, asigna la plantilla de página "Elementor ancho completo" para que el dashboard abarque todo el ancho de la pantalla.', 'observatorio-metricas' ); ?>
                </small>
            </div>

            <!-- Tarjeta: Zona de Restauración -->
            <?php if ( $is_custom ) : ?>
                <div class="obs-card" style="border-color: #fecaca; background: #fffaf0;">
                    <h2 style="color: #b91c1c;">⚠️ <?php esc_html_e( 'Zona de Mantenimiento', 'observatorio-metricas' ); ?></h2>
                    <p style="color: #7f1d1d;">
                        <?php esc_html_e( 'Si deseas descartar el archivo subido y volver al dataset inicial de fábrica (data.js), pulsa el botón a continuación:', 'observatorio-metricas' ); ?>
                    </p>
                    <form method="post" onsubmit="return confirm('¿Seguro que deseas restablecer los datos al estado inicial?');">
                        <?php wp_nonce_field( 'obs_reset_data_action' ); ?>
                        <button type="submit" name="obs_reset_data" class="button obs-btn-danger">
                            <?php esc_html_e( 'Restablecer a datos de fábrica', 'observatorio-metricas' ); ?>
                        </button>
                    </form>
                </div>
            <?php endif; ?>

        </div>
        <?php
    }

    public function get_upload_json_path(): string {
        $uploads = wp_upload_dir();
        return $uploads['basedir'] . '/observatorio-metricas/data.json';
    }

    public function get_default_questions(): array {
        $questions_file = OBS_METRICS_PLUGIN_DIR . 'includes/default-questions.json';
        if ( file_exists( $questions_file ) ) {
            $content = file_get_contents( $questions_file );
            $decoded = json_decode( $content, true );
            if ( is_array( $decoded ) ) {
                return $decoded;
            }
        }
        return [];
    }

    public function get_active_dataset(): array {
        $custom_file = $this->get_upload_json_path();
        if ( file_exists( $custom_file ) ) {
            $content = file_get_contents( $custom_file );
            $decoded = json_decode( $content, true );
            if ( is_array( $decoded ) ) {
                return $decoded;
            }
        }

        // Leer data.js base
        $data_js_path = OBS_METRICS_PLUGIN_DIR . 'assets/js/data.js';
        if ( file_exists( $data_js_path ) ) {
            $content = file_get_contents( $data_js_path );
            $json_str = trim( substr( $content, strpos( $content, '{' ) ) );
            if ( substr( $json_str, -1 ) === ';' ) {
                $json_str = substr( $json_str, 0, -1 );
            }
            $decoded = json_decode( $json_str, true );
            if ( is_array( $decoded ) ) {
                return $decoded;
            }
        }

        return [
            'totalCount' => 0,
            'longCount'  => 0,
            'shortCount' => 0,
            'questions'  => [],
            'records'    => [],
        ];
    }
}
