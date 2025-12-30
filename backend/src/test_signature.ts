
import path from 'path';
import { loadP12, signXml } from './services/signatureService';

const CERT_PATH = path.join(__dirname, '../certs/test-cert.p12');
const PASSWORD = 'password';

const sampleXml = '<eCF><Info>Test</Info></eCF>';

try {
  console.log(`Loading cert from: ${CERT_PATH}`);
  const keys = loadP12(CERT_PATH, PASSWORD);
  console.log('Certificate loaded successfully.');
  
  console.log('Signing XML...');
  const signed = signXml(sampleXml, keys.privateKeyPem, keys.certPem, "//*[local-name(.)='eCF']");
  console.log('XML Signed.');
  
  if (signed.includes('SignatureValue')) {
      console.log('Signature verification: LOOKS GOOD (SignatureValue present)');
  } else {
      console.error('Signature verification: FAILED (No SignatureValue)');
  }

} catch (error) {
  console.error('Signature Test FAILED:', error);
}
