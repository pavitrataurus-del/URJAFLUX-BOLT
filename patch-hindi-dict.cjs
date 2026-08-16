const fs = require('fs');

let content = fs.readFileSync('src/components/ReportsPage.tsx', 'utf8');

const originalDict = `  hi: {
    title: "ऊर्जाफ्लक्स डायग्नोस्टिक्स ओएस (URJAFLUX DIAGNOSTICS OS)",
    certification: "प्रमाणपत्र स्तर: स्वर्ण श्रेणी (GOLD CLASS)",
    regulatory: "नियामक वेद सामंजस्य: सक्रिय (REGULATORY VEDA)",
    published: "प्रकाशन तिथि (DATE PUBLISHED)",
    propertyData: "संपत्ति डेटा (PROPERTY ASSET DATA)",
    propertyName: "संपत्ति का नाम (Property Name)",
    owner: "स्वामी (Owner)",
    vibrationAssessment: "ऊर्जा मूल्यांकन (VIBRATION ASSESSMENT)",
    overallRating: "कुल वास्तु मूल्यांकन (Overall Vastu Rating)",
    beneficial: "लाभकारी (Beneficial)",
    decoupledApi: "डिकपल्ड एपीआई जांच (Decoupled API Check)",
    compliant: "१००% अनुपालन (100% COMPLIANT)",
    analysisAbstract: "परामर्शदाता विश्लेषण सार (CONSULTANT ANALYSIS ABSTRACT)",
    remedyRegister: "सुधारात्मक उपाय पंजी (COORDINATE REMEDY REGISTER)",
    zone: "क्षेत्र / दिशा (ZONE)",
    anomaly: "त्रुटि / दोष (ANOMALY)",
    remedy: "सुधारात्मक उपाय (REMEDY)",
    scripture: "शास्त्र सन्दर्भ (SCRIPTURE)",
    authorizedIssuer: "अधिकृत जारीकर्ता (AUTHORIZED ISSUER)",
    seal: "ऊर्जाफ्लक्स सुधारात्मक मुहर (Remediator Seal)",
    systemValidity: "सिस्टम वैधता (SYSTEM VALIDITY)",
    verifiedMetric: "सत्यापित मीट्रिक (VERIFIED METRIC)"
  }`;

const newDict = `  hi: {
    title: "ऊर्जाफ्लक्स डायग्नोस्टिक्स ओएस",
    certification: "प्रमाणपत्र स्तर: स्वर्ण श्रेणी",
    regulatory: "नियामक वेद सामंजस्य: सक्रिय",
    published: "प्रकाशन तिथि",
    propertyData: "संपत्ति डेटा",
    propertyName: "संपत्ति का नाम",
    owner: "स्वामी",
    vibrationAssessment: "ऊर्जा मूल्यांकन",
    overallRating: "कुल वास्तु मूल्यांकन",
    beneficial: "लाभकारी",
    decoupledApi: "डिकपल्ड एपीआई जांच",
    compliant: "१००% अनुपालन",
    analysisAbstract: "परामर्शदाता विश्लेषण सार",
    remedyRegister: "सुधारात्मक उपाय पंजी",
    zone: "क्षेत्र / दिशा",
    anomaly: "त्रुटि / दोष",
    remedy: "सुधारात्मक उपाय",
    scripture: "शास्त्र सन्दर्भ",
    authorizedIssuer: "अधिकृत जारीकर्ता",
    seal: "ऊर्जाफ्लक्स सुधारात्मक मुहर",
    systemValidity: "सिस्टम वैधता",
    verifiedMetric: "सत्यापित मीट्रिक"
  }`;

content = content.replace(originalDict, newDict);

fs.writeFileSync('src/components/ReportsPage.tsx', content);
console.log('Patched Hindi Dictionary in ReportsPage.tsx');
