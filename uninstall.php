<?php
/**
 * Observatorio Métricas - Uninstaller
 *
 * Se ejecuta automáticamente cuando el plugin es eliminado desde el panel de WordPress.
 * Limpia todas las opciones de la base de datos y los archivos temporales/uploads generados.
 */

if ( ! defined( 'WP_UNINSTALL_PLUGIN' ) ) {
    exit;
}

// 1. Depurar opciones registradas en wp_options
delete_option( 'obs_metrics_last_update' );

// 2. Depurar archivos creados en wp-content/uploads/observatorio-metricas/
$upload_dir  = wp_upload_dir();
$metrics_dir = $upload_dir['basedir'] . '/observatorio-metricas';

if ( is_dir( $metrics_dir ) ) {
    $files = glob( $metrics_dir . '/*' );
    if ( is_array( $files ) ) {
        foreach ( $files as $file ) {
            if ( is_file( $file ) ) {
                unlink( $file );
            }
        }
    }
    @rmdir( $metrics_dir );
}
