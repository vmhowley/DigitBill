import { DOMParser } from '@xmldom/xmldom';
import fs from 'fs';
import forge from 'node-forge';
import { SignedXml } from 'xml-crypto';

interface KeyPair {
  privateKeyPem: string;
  certPem: string;
}

export const loadP12 = (p12Path: string, password: string): KeyPair => {
  const p12Der = fs.readFileSync(p12Path, 'binary');
  const p12Asn1 = forge.asn1.fromDer(p12Der);
  const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, password);
  
  let privateKey: any = null;
  let certificate: any = null;

  for (const safeContent of p12.safeContents) {
    for (const safeBag of safeContent.safeBags) {
      if (safeBag.type === forge.pki.oids.pkcs8ShroudedKeyBag) {
        privateKey = safeBag.key;
      } else if (safeBag.type === forge.pki.oids.certBag) {
        certificate = safeBag.cert;
      }
    }
  }

  if (!privateKey || !certificate) {
    throw new Error('Could not find private key or certificate in .p12 file');
  }

  return {
    privateKeyPem: forge.pki.privateKeyToPem(privateKey),
    certPem: forge.pki.certificateToPem(certificate)
  };
};



export const signXml = (xmlString: string, privateKeyPem: string, certPem: string, referenceXPath: string = "//*[local-name(.)='eCF']"): string => {
  // Note: DOMParser from 'xmldom' is needed. 
  // Ensure 'xmldom' is installed: npm i xmldom @types/xmldom
  // The user example used 'xmldom' but I installed 'xml-crypto' which might need it.
  // Actually, 'xml-crypto' usually works with DOM nodes.
  
  const doc = new DOMParser().parseFromString(xmlString);
  const sig = new SignedXml({ 
    privateKey: privateKeyPem,
    signatureAlgorithm: "http://www.w3.org/2001/04/xmldsig-more#rsa-sha256",
    canonicalizationAlgorithm: "http://www.w3.org/TR/2001/REC-xml-c14n-20010315"
  } as any);

  sig.addReference({
    xpath: referenceXPath,
    transforms: [
      "http://www.w3.org/2000/09/xmldsig#enveloped-signature",
      "http://www.w3.org/TR/2001/REC-xml-c14n-20010315"
    ],
    digestAlgorithm: "http://www.w3.org/2001/04/xmlenc#sha256"
  });

  (sig as any).keyInfoProvider = {
    getKeyInfo: () => `<X509Data><X509Certificate>${certPem.replace(/-----.*CERTIFICATE-----/g,'').replace(/\n/g,'')}</X509Certificate></X509Data>`
  };

  sig.computeSignature(xmlString, { location: { reference: "", action: "append" } });
  return sig.getSignedXml();
};
