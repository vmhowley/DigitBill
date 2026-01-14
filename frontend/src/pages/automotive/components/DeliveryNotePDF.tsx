
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

const styles = StyleSheet.create({
    page: {
        padding: 40,
        fontSize: 10,
        lineHeight: 1.5,
    },
    header: {
        marginBottom: 20,
        borderBottom: 1,
        borderBottomColor: '#ccc',
        paddingBottom: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        color: '#111827'
    },
    subtitle: {
        fontSize: 10,
        color: '#6B7280'
    },
    section: {
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        marginBottom: 5,
        backgroundColor: '#F3F4F6',
        padding: 5,
        color: '#374151'
    },
    row: {
        flexDirection: 'row',
        marginBottom: 4,
    },
    col: {
        flex: 1,
    },
    label: {
        color: '#6B7280',
        fontSize: 9,
        width: 100,
    },
    value: {
        color: '#111827',
        fontWeight: 500,
        flex: 1,
    },
    checklist: {
        marginTop: 10,
    },
    checkItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
    },
    box: {
        width: 12,
        height: 12,
        borderWidth: 1,
        borderColor: '#000',
        marginRight: 10,
    },
    signatures: {
        marginTop: 50,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    signatureBox: {
        width: '45%',
        borderTopWidth: 1,
        borderTopColor: '#000',
        paddingTop: 8,
        alignItems: 'center',
    },
    pass: {
        marginTop: 30,
        borderWidth: 2,
        borderColor: '#111827',
        padding: 15,
        alignItems: 'center',
        borderStyle: 'dashed'
    },
    passTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 5
    }
});

export const DeliveryNotePDF = ({ sale }: { sale: any }) => {
    if (!sale) return null;

    const {
        client_name, client_tax_id,
        make, model, year, vin, color, plate,
        created_at
    } = sale;

    return (
        <Document>
            <Page size="LETTER" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.title}>Conduce de Salida</Text>
                        <Text style={styles.subtitle}>Autorización de Entrega #DLV-{sale.id}</Text>
                    </View>
                    <View>
                        <Text style={styles.subtitle}>Fecha: {new Date().toLocaleDateString()}</Text>
                    </View>
                </View>

                {/* Datos del Cliente y Vehículo */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>DETALLES DE LA ENTREGA</Text>
                    <View style={{ flexDirection: 'row' }}>
                        <View style={styles.col}>
                            <View style={styles.row}>
                                <Text style={styles.label}>Cliente:</Text>
                                <Text style={styles.value}>{client_name}</Text>
                            </View>
                            <View style={styles.row}>
                                <Text style={styles.label}>ID / RNC:</Text>
                                <Text style={styles.value}>{client_tax_id || 'N/A'}</Text>
                            </View>
                        </View>
                        <View style={styles.col}>
                            <View style={styles.row}>
                                <Text style={styles.label}>Vehículo:</Text>
                                <Text style={styles.value}>{make} {model} {year}</Text>
                            </View>
                            <View style={styles.row}>
                                <Text style={styles.label}>VIN:</Text>
                                <Text style={styles.value}>{vin}</Text>
                            </View>
                            <View style={styles.row}>
                                <Text style={styles.label}>Color:</Text>
                                <Text style={styles.value}>{color}</Text>
                            </View>
                            <View style={styles.row}>
                                <Text style={styles.label}>Placa:</Text>
                                <Text style={styles.value}>{plate || 'En Trámite'}</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Checklist de Accesorios */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>CHECKLIST DE ACCESORIOS Y CONDICIONES</Text>
                    <Text style={{ fontSize: 9, color: '#6B7280', marginBottom: 10 }}>
                        Verifique los artículos entregados con el vehículo.
                    </Text>

                    <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                        {[
                            'Juego de Llaves (2)',
                            'Manual de Usuario',
                            'Goma de Repuesto',
                            'Gato y Herramientas',
                            'Alfombras',
                            'Extintor / Triángulo',
                            'Sistema Multimedia',
                            'Condición Pintura OK',
                            'Condición Interior OK'
                        ].map((item, i) => (
                            <View key={i} style={{ width: '50%', ...styles.checkItem }}>
                                <View style={styles.box} />
                                <Text>{item}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Pase de Salida (Para Seguridad) */}
                <View style={styles.pass}>
                    <Text style={styles.passTitle}>PASE DE SALIDA AUTORIZADO</Text>
                    <Text style={{ fontSize: 12 }}>VALIDADO POR SEGURIDAD / GERENCIA</Text>
                    <Text style={{ marginTop: 5, fontSize: 10 }}>Permitir salida de: {make} {model} ({color})</Text>
                </View>

                {/* Firmas */}
                <View style={styles.signatures}>
                    <View style={styles.signatureBox}>
                        <Text style={{ fontWeight: 'bold' }}>ENTREGADO POR</Text>
                        <Text style={{ fontSize: 8, color: '#6B7280', marginTop: 2 }}>Firma Autorizada Dealer</Text>
                    </View>
                    <View style={styles.signatureBox}>
                        <Text style={{ fontWeight: 'bold' }}>RECIBIDO CONFORME</Text>
                        <Text style={{ fontSize: 8, color: '#6B7280', marginTop: 2 }}>Firma del Cliente</Text>
                    </View>
                </View>

                <Text style={{ position: 'absolute', bottom: 30, left: 40, fontSize: 8, color: '#ccc' }}>
                    DigitBill Automotive - Control de Inventario
                </Text>
            </Page>
        </Document>
    );
};
