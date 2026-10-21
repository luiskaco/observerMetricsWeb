<?php
/**
 * Plugin Name: Observatorio Métricas - Encuesta Cáncer de Mama
 * Plugin URI:  https://observatoriodecancer.pe
 * Description: Dashboard interactivo de resultados y métricas de la Encuesta La Ruta de la Paciente con Cáncer de Mama (Chart.js, filtros por sistema de salud y región con importador Excel en WP Admin).
 * Version:     1.8.2
 * Author:      Observatorio de Cáncer
 * Text Domain: observatorio-metricas
 * License:     GPL-2.0+
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

define( 'OBS_METRICS_VERSION', '1.8.2' );
define( 'OBS_METRICS_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'OBS_METRICS_PLUGIN_URL', plugin_dir_url( __FILE__ ) );

final class Observatorio_Metricas {

    private static ?Observatorio_Metricas $instance = null;

    public static function instance(): Observatorio_Metricas {
        if ( null === self::$instance ) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    private function __construct() {
        require_once OBS_METRICS_PLUGIN_DIR . 'includes/class-admin.php';
        Observatorio_Metricas_Admin::instance();

        add_action( 'wp_enqueue_scripts', [ $this, 'register_assets' ] );
        add_shortcode( 'observatorio_metricas', [ $this, 'render_shortcode' ] );
        add_shortcode( 'observatorio_metrics', [ $this, 'render_shortcode' ] );
    }

    public function register_assets(): void {
        wp_register_style(
            'obs-metrics-google-fonts',
            'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap',
            [],
            null
        );

        wp_register_style(
            'obs-metrics-frontend',
            OBS_METRICS_PLUGIN_URL . 'assets/css/styles.css',
            [ 'obs-metrics-google-fonts' ],
            OBS_METRICS_VERSION
        );

        wp_register_script(
            'chartjs-cdn',
            'https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js',
            [],
            '4.4.1',
            true
        );

        wp_register_script(
            'obs-metrics-data',
            OBS_METRICS_PLUGIN_URL . 'assets/js/data.js',
            [],
            OBS_METRICS_VERSION,
            true
        );

        wp_register_script(
            'obs-metrics-app',
            OBS_METRICS_PLUGIN_URL . 'assets/js/app.js',
            [ 'chartjs-cdn', 'obs-metrics-data' ],
            OBS_METRICS_VERSION,
            true
        );
    }

    public function render_shortcode( $atts = [] ): string {
        wp_enqueue_style( 'obs-metrics-frontend' );

        $custom_json_file = WP_CONTENT_DIR . '/uploads/observatorio-metricas/data.json';
        if ( file_exists( $custom_json_file ) ) {
            $json_content = file_get_contents( $custom_json_file );
            wp_register_script( 'obs-metrics-custom-data', false, [], OBS_METRICS_VERSION, true );
            wp_enqueue_script( 'obs-metrics-custom-data' );
            wp_add_inline_script( 'obs-metrics-custom-data', 'const DATA = ' . $json_content . ';', 'before' );

            wp_deregister_script( 'obs-metrics-app' );
            wp_register_script(
                'obs-metrics-app',
                OBS_METRICS_PLUGIN_URL . 'assets/js/app.js',
                [ 'chartjs-cdn', 'obs-metrics-custom-data' ],
                OBS_METRICS_VERSION,
                true
            );
        } else {
            wp_enqueue_script( 'obs-metrics-data' );
        }

        wp_enqueue_script( 'obs-metrics-app' );

        ob_start();
        include OBS_METRICS_PLUGIN_DIR . 'templates/dashboard-view.php';
        return ob_get_clean();
    }

    public static function activate(): void {
        $upload_dir  = wp_upload_dir();
        $metrics_dir = $upload_dir['basedir'] . '/observatorio-metricas';
        if ( ! is_dir( $metrics_dir ) ) {
            wp_mkdir_p( $metrics_dir );
        }
    }
}

register_activation_hook( __FILE__, [ 'Observatorio_Metricas', 'activate' ] );
add_action( 'plugins_loaded', [ 'Observatorio_Metricas', 'instance' ] );
