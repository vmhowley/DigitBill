import fs from 'fs';
import forge from 'node-forge';
import path from 'path';

const generateCert = () => {
    console.log('Generating self-signed certificate...');

    // 1. Generate Key Pair
    const keys = forge.pki.rsa.generateKeyPair(2048);

    // 2. Create Certificate
    const cert = forge.pki.createCertificate();
    cert.publicKey = keys.publicKey;
    cert.serialNumber = '01';
    cert.validity.notBefore = new Date();
    cert.validity.notAfter = new Date();
    cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 1);

    const attrs = [{
        name: 'commonName',
        value: 'Test Company'
    }, {
        name: 'countryName',
        value: 'DO'
    }, {
        shortName: 'ST',
        value: 'Santo Domingo'
    }, {
        name: 'organizationName',
        value: 'Test Org'
    }];

    cert.setSubject(attrs);
    cert.setIssuer(attrs);
    cert.sign(keys.privateKey, forge.md.sha256.create());

    // 3. Create P12
    const p12Asn1 = forge.pkcs12.toPkcs12Asn1(
        keys.privateKey,
        [cert],
        'password', // Password
        { algorithm: '3des' }
    );

    const p12Der = forge.asn1.toDer(p12Asn1).getBytes();

    // 4. Save to file
    const certDir = path.join(__dirname, '../../certs');
    if (!fs.existsSync(certDir)) {
        fs.mkdirSync(certDir, { recursive: true });
    }

    const certPath = path.join(certDir, 'test-cert.p12');
    fs.writeFileSync(certPath, p12Der, 'binary');

    console.log(`Certificate generated successfully at: ${certPath}`);
    console.log('Password: password');
};

generateCert();
