
import { checkRNC } from '../services/dgiiService';

async function test() {
    console.log("Testing RNC Validation...");

    const testCases = [
        { rnc: '101017961', expect: true, label: 'Banco Popular (Valid RNC)' },
        { rnc: '131652755', expect: true, label: 'DigitBill (Valid RNC)' },
        { rnc: '00116630876', expect: true, label: 'Valid Cedula' }, // Example format
        { rnc: '123456789', expect: false, label: 'Invalid RNC (Bad Checksum)' },
        { rnc: '000000000', expect: false, label: 'Invalid RNC (Zeros)' },
        { rnc: '123', expect: false, label: 'Invalid Length' }
    ];

    for (const test of testCases) {
        const result = await checkRNC(test.rnc, 1);
        const isValid = result !== null;

        if (isValid === test.expect) {
            console.log(`[PASS] ${test.label}: ${test.rnc} -> ${isValid ? 'Valid' : 'Invalid'}`);
        } else {
            console.error(`[FAIL] ${test.label}: ${test.rnc} -> Expected ${test.expect}, got ${isValid}`);
        }
    }
}

test();
