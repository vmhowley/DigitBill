
import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer';

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
    table: {
        marginTop: 10,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
        padding: 5,
    },
    tableHeader: {
        backgroundColor: '#F9FAFB',
        fontWeight: 'bold',
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
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 40,
        right: 40,
        fontSize: 8,
        color: '#9CA3AF',
        textAlign: 'center',
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        paddingTop: 10
    }
});

export const SalesContractPDF = ({ sale }: { sale: any }) => {
    if (!sale) return null;

    const {
        client_name, client_phone, client_tax_id,
        make, model, year, vin, color, plate,
        sale_price, down_payment, financed_amount, monthly_payment,
        interest_rate, term_months
    } = sale;

    return (
        <Document>
            <Page size="LETTER" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.title}>Contrato de Venta</Text>
                        <Text style={styles.subtitle}>Ref: VENTA-{sale.id.toString().padStart(6, '0')}</Text>
                    </View>
                    <View>
                        <Text style={styles.subtitle}>Fecha: {new Date(sale.created_at).toLocaleDateString()}</Text>
                    </View>
                </View>

                {/* 1. Las Partes */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>1. DATOS DEL COMPRADOR</Text>
                    <View style={styles.row}>
                        <Text style={styles.label}>Nombre:</Text>
                        <Text style={styles.value}>{client_name}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Cédula/RNC:</Text>
                        <Text style={styles.value}>{client_tax_id || 'N/A'}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Teléfono:</Text>
                        <Text style={styles.value}>{client_phone || 'N/A'}</Text>
                    </View>
                </View>

                {/* 2. El Vehículo */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>2. DATOS DEL VEHÍCULO</Text>
                    <View style={{ flexDirection: 'row' }}>
                        <View style={styles.col}>
                            <View style={styles.row}>
                                <Text style={styles.label}>Marca:</Text>
                                <Text style={styles.value}>{make}</Text>
                            </View>
                            <View style={styles.row}>
                                <Text style={styles.label}>Modelo:</Text>
                                <Text style={styles.value}>{model}</Text>
                            </View>
                            <View style={styles.row}>
                                <Text style={styles.label}>Año:</Text>
                                <Text style={styles.value}>{year}</Text>
                            </View>
                        </View>
                        <View style={styles.col}>
                            <View style={styles.row}>
                                <Text style={styles.label}>VIN (Chasis):</Text>
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

                {/* 3. Condiciones Económicas */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>3. CONDICIONES ECONÓMICAS</Text>
                    <View style={styles.row}>
                        <Text style={styles.label}>Precio de Venta:</Text>
                        <Text style={styles.value}>RD$ {parseFloat(sale_price).toLocaleString()}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Inicial:</Text>
                        <Text style={styles.value}>RD$ {parseFloat(down_payment || 0).toLocaleString()}</Text>
                    </View>

                    {financed_amount > 0 && (
                        <View style={{ marginTop: 10, padding: 10, backgroundColor: '#F9FAFB', borderRadius: 4 }}>
                            <Text style={{ fontWeight: 'bold', marginBottom: 5 }}>Financiamiento Acordado:</Text>
                            <View style={styles.row}>
                                <Text style={styles.label}>Monto Financiado:</Text>
                                <Text style={styles.value}>RD$ {parseFloat(financed_amount).toLocaleString()}</Text>
                            </View>
                            <View style={styles.row}>
                                <Text style={styles.label}>Tasa Interés:</Text>
                                <Text style={styles.value}>{interest_rate}% Anual</Text>
                            </View>
                            <View style={styles.row}>
                                <Text style={styles.label}>Plazo:</Text>
                                <Text style={styles.value}>{term_months} Meses</Text>
                            </View>
                            <View style={styles.row}>
                                <Text style={styles.label}>Cuota Mensual:</Text>
                                <Text style={{ ...styles.value, fontWeight: 'bold' }}>RD$ {parseFloat(monthly_payment).toLocaleString()}</Text>
                            </View>
                        </View>
                    )}
                </View>

                {/* 4. Cláusulas Legales */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>4. ACEPTACIÓN Y COMPROMISO</Text>
                    <Text style={{ textAlign: 'justify', fontSize: 9, color: '#4B5563' }}>
                        El COMPRADOR declara haber recibido el vehículo descrito anteriormente en las condiciones actuales
                        (donde está y como está), habiendo realizado las pruebas mecánicas y de manejo pertinentes.
                        {financed_amount > 0 ?
                            ` Asimismo, reconoce la deuda por el monto financiado y se compromete a realizar los pagos mensuales según lo estipulado, aceptando que el vehículo funge como garantía hasta la saldación total de la deuda.`
                            : ' El vehículo se entrega libre de cargas y gravámenes una vez pagado el precio total.'}
                    </Text>
                </View>

                {/* Firmas */}
                <View style={styles.signatures}>
                    <View style={styles.signatureBox}>
                        <Text style={{ fontWeight: 'bold' }}>LA EMPRESA</Text>
                        <Text style={{ fontSize: 8, color: '#6B7280', marginTop: 2 }}>Vendedor Autorizado</Text>
                    </View>
                    <View style={styles.signatureBox}>
                        <Text style={{ fontWeight: 'bold' }}>{client_name ? client_name.toUpperCase() : 'EL CLIENTE'}</Text>
                        <Text style={{ fontSize: 8, color: '#6B7280', marginTop: 2 }}>Comprador</Text>
                    </View>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <Text>Este documento es un comprobante de venta válido y legal.</Text>
                </View>
            </Page>
        </Document>
    );
};
