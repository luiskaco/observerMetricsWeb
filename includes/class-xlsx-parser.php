<?php
/**
 * Observatorio XLSX Parser (Resiliente)
 *
 * Parser multi-entorno para leer archivos .xlsx:
 * 1. Utiliza ZipArchive si está habilitado.
 * 2. Si ZipArchive no está activo en el servidor (Apache/PHP), utiliza un extractor
 *    de respaldo (tar.exe nativo en Windows/Linux o PowerShell) hacia un directorio temporal.
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class Observatorio_Xlsx_Parser {

    /**
     * Procesa un archivo .xlsx y retorna el dataset listo para el dashboard.
     *
     * @param string $file_path Ruta absoluta al archivo .xlsx
     * @return array
     * @throws Exception
     */
    public static function parse( string $file_path ): array {
        if ( ! file_exists( $file_path ) ) {
            throw new Exception( __( 'El archivo subido no existe o fue eliminado.', 'observatorio-metricas' ) );
        }

        $xml_contents = self::extract_xml_contents( $file_path );

        // 1. Cargar cadenas compartidas (sharedStrings.xml)
        $shared_strings = [];
        if ( ! empty( $xml_contents['shared_strings'] ) ) {
            $sxml = simplexml_load_string( $xml_contents['shared_strings'] );
            if ( $sxml && isset( $sxml->si ) ) {
                foreach ( $sxml->si as $si ) {
                    $t = '';
                    if ( isset( $si->t ) ) {
                        $t = (string) $si->t;
                    } elseif ( isset( $si->r ) ) {
                        foreach ( $si->r as $r ) {
                            $t .= (string) $r->t;
                        }
                    }
                    $shared_strings[] = $t;
                }
            }
        }

        // 2. Cargar hoja de datos
        if ( empty( $xml_contents['sheet'] ) ) {
            throw new Exception( __( 'No se encontró la hoja de cálculo en el archivo Excel.', 'observatorio-metricas' ) );
        }

        $sheet_xml = simplexml_load_string( $xml_contents['sheet'] );
        if ( ! $sheet_xml || ! isset( $sheet_xml->sheetData->row ) ) {
            throw new Exception( __( 'La hoja de cálculo está vacía o dañada.', 'observatorio-metricas' ) );
        }

        $rows = $sheet_xml->sheetData->row;
        $total_rows = count( $rows );
        if ( $total_rows < 2 ) {
            throw new Exception( __( 'El archivo no contiene filas de datos.', 'observatorio-metricas' ) );
        }

        // Columnas esperadas en el modelo (de H a AX)
        $cols = [
            'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q',
            'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
            'AA', 'AB', 'AC', 'AD', 'AE', 'AF', 'AG', 'AH', 'AI', 'AJ',
            'AK', 'AL', 'AM', 'AN', 'AO', 'AP', 'AQ', 'AR', 'AS', 'AT',
            'AU', 'AV', 'AW', 'AX'
        ];

        $records = [];
        $long_count = 0;
        $short_count = 0;

        for ( $i = 1; $i < $total_rows; $i++ ) {
            $row = $rows[ $i ];
            $cells = [];
            foreach ( $row->c as $c ) {
                $ref = (string) $c['r'];
                $col_name = preg_replace( '/\d+/', '', $ref );
                $type = (string) $c['t'];
                $val = (string) $c->v;
                if ( $type === 's' && isset( $shared_strings[ (int) $val ] ) ) {
                    $val = $shared_strings[ (int) $val ];
                }
                $cells[ $col_name ] = trim( $val );
            }

            // Ignorar filas totalmente vacías
            if ( empty( $cells['A'] ) && empty( $cells['H'] ) ) {
                continue;
            }

            // Clasificación: Encuesta Corta no contiene Nombres (C), Apellidos (D) ni Celular (F)
            $is_short = empty( $cells['C'] ) && empty( $cells['D'] ) && empty( $cells['F'] );
            $survey_type = $is_short ? 'Encuesta Corta' : 'Encuesta Completa';

            if ( $is_short ) {
                $short_count++;
            } else {
                $long_count++;
            }

            $rec = [ 'survey' => $survey_type ];
            foreach ($cols as $col) {
                $val = $cells[ $col ] ?? '';
                if ( '' === $val ) {
                    $val = 'No respondió';
                } else {
                    // Normalizaciones estándar para consistencia
                    if ( 'Si' === $val ) {
                        $val = 'Sí';
                    }
                    if ( 'Privado → público' === $val ) {
                        $val = 'Privado → Público';
                    }
                    if ( 'Público → privado' === $val ) {
                        $val = 'Público → Privado';
                    }
                }
                $rec[ $col ] = $val;
            }

            $records[] = $rec;
        }

        return [
            'totalCount' => count( $records ),
            'longCount'  => $long_count,
            'shortCount' => $short_count,
            'records'    => $records,
        ];
    }

    /**
     * Extrae los XMLs requeridos del archivo .xlsx mediante ZipArchive o fallback del sistema.
     *
     * @param string $file_path
     * @return array ['shared_strings' => string, 'sheet' => string]
     * @throws Exception
     */
    private static function extract_xml_contents( string $file_path ): array {
        // 1. Intento primario con ZipArchive nativo
        if ( class_exists( 'ZipArchive' ) ) {
            $zip = new ZipArchive();
            if ( $zip->open( $file_path ) === true ) {
                $shared_strings = $zip->getFromName( 'xl/sharedStrings.xml' ) ?: '';
                $sheet_path = 'xl/worksheets/sheet1.xml';

                // Buscar pestaña TOTAL si existe workbook.xml
                $wb_xml = $zip->getFromName( 'xl/workbook.xml' );
                if ( $wb_xml ) {
                    $wb = simplexml_load_string( $wb_xml );
                    if ( $wb && isset( $wb->sheets->sheet ) ) {
                        foreach ( $wb->sheets->sheet as $sheet ) {
                            if ( strtoupper( (string) $sheet['name'] ) === 'TOTAL' ) {
                                $rel_id = (string) $sheet->attributes( 'http://schemas.openxmlformats.org/officeDocument/2006/relationships' )['id'];
                                $rels_xml = $zip->getFromName( 'xl/_rels/workbook.xml.rels' );
                                if ( $rels_xml ) {
                                    $rels = simplexml_load_string( $rels_xml );
                                    if ( $rels ) {
                                        foreach ( $rels->Relationship as $rel ) {
                                            if ( (string) $rel['Id'] === $rel_id ) {
                                                $target = (string) $rel['Target'];
                                                $sheet_path = ( strpos( $target, 'worksheets/' ) !== false ) ? 'xl/' . ltrim( $target, '/' ) : 'xl/worksheets/' . basename( $target );
                                                break;
                                            }
                                        }
                                    }
                                }
                                break;
                            }
                        }
                    }
                }

                $sheet_content = $zip->getFromName( $sheet_path ) ?: '';
                $zip->close();

                if ( ! empty( $sheet_content ) ) {
                    return [
                        'shared_strings' => $shared_strings,
                        'sheet'          => $sheet_content,
                    ];
                }
            }
        }

        // 2. Intento secundario: Fallback por comando del sistema (tar / powershell / unzip)
        $uploads_dir = wp_upload_dir();
        $temp_dir = $uploads_dir['basedir'] . '/obs_temp_xlsx_' . md5( $file_path . microtime() );
        wp_mkdir_p( $temp_dir );

        $extracted = false;

        // Probar con tar.exe (incluido en Windows 10/11 y Linux)
        $cmd_tar = 'tar.exe -xf ' . escapeshellarg( $file_path ) . ' -C ' . escapeshellarg( $temp_dir ) . ' 2>&1';
        @exec( $cmd_tar, $out_tar, $ret_tar );
        if ( 0 === $ret_tar && file_exists( $temp_dir . '/xl/worksheets/sheet1.xml' ) ) {
            $extracted = true;
        }

        // Probar con PowerShell Expand-Archive si tar no extrajo
        if ( ! $extracted ) {
            $ps_cmd = 'powershell.exe -NoProfile -NonInteractive -Command "Expand-Archive -Path \'' . addslashes( $file_path ) . '\' -DestinationPath \'' . addslashes( $temp_dir ) . '\' -Force" 2>&1';
            @exec( $ps_cmd, $out_ps, $ret_ps );
            if ( file_exists( $temp_dir . '/xl/worksheets/sheet1.xml' ) ) {
                $extracted = true;
            }
        }

        // Probar con unzip en servidores Linux/macOS
        if ( ! $extracted ) {
            $unzip_cmd = 'unzip -q ' . escapeshellarg( $file_path ) . ' -d ' . escapeshellarg( $temp_dir ) . ' 2>&1';
            @exec( $unzip_cmd, $out_unzip, $ret_unzip );
            if ( 0 === $ret_unzip && file_exists( $temp_dir . '/xl/worksheets/sheet1.xml' ) ) {
                $extracted = true;
            }
        }

        if ( ! $extracted ) {
            self::delete_dir_recursive( $temp_dir );
            throw new Exception( __( 'No se pudo descomprimir el archivo Excel. Por favor verifica que el archivo no esté protegido con contraseña o reinicia Apache en Laragon para cargar la extensión PHP ZipArchive.', 'observatorio-metricas' ) );
        }

        $shared_strings = file_exists( $temp_dir . '/xl/sharedStrings.xml' ) ? file_get_contents( $temp_dir . '/xl/sharedStrings.xml' ) : '';
        $sheet_path = $temp_dir . '/xl/worksheets/sheet1.xml';

        // Buscar hoja TOTAL en el directorio temporal
        if ( file_exists( $temp_dir . '/xl/workbook.xml' ) ) {
            $wb = simplexml_load_file( $temp_dir . '/xl/workbook.xml' );
            if ( $wb && isset( $wb->sheets->sheet ) ) {
                $idx = 1;
                foreach ( $wb->sheets->sheet as $sheet ) {
                    if ( strtoupper( (string) $sheet['name'] ) === 'TOTAL' ) {
                        $candidate = $temp_dir . '/xl/worksheets/sheet' . $idx . '.xml';
                        if ( file_exists( $candidate ) ) {
                            $sheet_path = $candidate;
                        }
                        break;
                    }
                    $idx++;
                }
            }
        }

        $sheet_content = file_exists( $sheet_path ) ? file_get_contents( $sheet_path ) : '';
        self::delete_dir_recursive( $temp_dir );

        return [
            'shared_strings' => $shared_strings,
            'sheet'          => $sheet_content,
        ];
    }

    private static function delete_dir_recursive( string $dir ): void {
        if ( ! is_dir( $dir ) ) {
            return;
        }
        $files = scandir( $dir );
        foreach ( $files as $file ) {
            if ( '.' === $file || '..' === $file ) {
                continue;
            }
            $path = $dir . '/' . $file;
            if ( is_dir( $path ) ) {
                self::delete_dir_recursive( $path );
            } else {
                @unlink( $path );
            }
        }
        @rmdir( $dir );
    }
}
